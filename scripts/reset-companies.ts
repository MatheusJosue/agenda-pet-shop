import { createClient } from "@supabase/supabase-js";
import { existsSync, readFileSync } from "node:fs";

loadEnvFile(".env.local");

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const apply = process.argv.includes("--apply");

const TARGETS = {
  admin: {
    name: "admin master",
    email: "admin-master@agenda.local",
  },
  carol: {
    name: "carolpethouse",
    email: "carolpethouse@agenda.local",
  },
} as const;

const CAROL_PACKAGE_TYPES = [
  { name: "Pequeno - Semanal", interval_days: 7, credits: 4, price: 200 },
  { name: "Pequeno - Quinzenal", interval_days: 15, credits: 2, price: 130 },
  { name: "Pequeno - Mensal", interval_days: 30, credits: 1, price: 70 },
  { name: "Médio - Semanal", interval_days: 7, credits: 4, price: 260 },
  { name: "Médio - Quinzenal", interval_days: 15, credits: 2, price: 170 },
  { name: "Médio - Mensal", interval_days: 30, credits: 1, price: 90 },
  { name: "Grande - Semanal", interval_days: 7, credits: 4, price: 320 },
  { name: "Grande - Quinzenal", interval_days: 15, credits: 2, price: 210 },
  { name: "Grande - Mensal", interval_days: 30, credits: 1, price: 110 },
] as const;

const BUSINESS_TABLES = [
  "clients",
  "pets",
  "appointments",
  "pet_packages",
  "package_types",
  "service_prices",
  "services",
  "plans",
  "client_plans",
] as const;

const DELETE_TABLES = [
  "appointment_services",
  "appointments",
  "pet_packages",
  "client_plans",
  "pets",
  "clients",
  "package_types",
  "service_prices",
  "plans",
  "services",
  "invites",
  "users",
  "companies",
] as const;

if (!supabaseUrl || !serviceRoleKey) {
  throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

type Company = {
  id: string;
  name: string;
  email: string;
};

async function main() {
  console.log(apply ? "APPLY MODE" : "DRY RUN");

  const companies = await selectAll<Company>("companies", "id,name,email");
  const existingUsers = await selectAll<{ id: string; email: string; role: string; company_id: string | null }>(
    "users",
    "id,email,role,company_id",
  );

  const currentCounts = await countByCompany(companies);
  printCurrentState(companies, existingUsers, currentCounts);

  if (!apply) {
    console.log("\nNo changes made. Run with --apply to execute this reset.");
    return;
  }

  const adminCompany = await upsertCompany(TARGETS.admin);
  const carolCompany = await upsertCompany(TARGETS.carol);
  const keepCompanyIds = [adminCompany.id, carolCompany.id];

  await moveBusinessDataToCarol(carolCompany.id);
  await moveUsers(adminCompany.id, carolCompany.id);
  await removeOtherAuthUsers();
  await deleteNonTargetRows(keepCompanyIds);

  const finalCompanies = await selectAll<Company>("companies", "id,name,email");
  const finalUsers = await selectAll<{ id: string; email: string; role: string; company_id: string | null }>(
    "users",
    "id,email,role,company_id",
  );
  const finalCounts = await countByCompany(finalCompanies);

  console.log("\nFinal state");
  printCurrentState(finalCompanies, finalUsers, finalCounts);
}

async function upsertCompany(input: { name: string; email: string }) {
  const existing = await findCompanyByEmailOrName(input.email, input.name);
  if (existing) {
    await must(
      supabase
        .from("companies")
        .update({ name: input.name, email: input.email, active: true, updated_at: new Date().toISOString() })
        .eq("id", existing.id),
      `update company ${input.name}`,
    );
    return { ...existing, ...input };
  }

  const { data, error } = await supabase
    .from("companies")
    .insert({ name: input.name, email: input.email, active: true })
    .select("id,name,email")
    .single();
  if (error) throw new Error(`create company ${input.name}: ${error.message}`);
  return data as Company;
}

async function findCompanyByEmailOrName(email: string, name: string) {
  const { data, error } = await supabase
    .from("companies")
    .select("id,name,email")
    .or(`email.eq.${email},name.eq.${name}`)
    .limit(1);
  if (error) throw new Error(`find company ${name}: ${error.message}`);
  return (data?.[0] as Company | undefined) || null;
}

async function moveBusinessDataToCarol(carolCompanyId: string) {
  for (const table of BUSINESS_TABLES.filter((table) => table !== "service_prices")) {
    await updateCompanyId(table, carolCompanyId);
  }
  await consolidateServicePrices(carolCompanyId);
  await normalizeCarolPackageTypes(carolCompanyId);
}

async function consolidateServicePrices(carolCompanyId: string) {
  type ServicePriceRow = {
    id: string;
    company_id: string;
    service_name: string;
    billing_type: string;
    hair_type: string | null;
    size_category: string;
    updated_at: string | null;
  };

  const servicePrices = await selectAll<ServicePriceRow>(
    "service_prices",
    "id,company_id,service_name,billing_type,hair_type,size_category,updated_at",
  );

  const appointmentReferences = await selectAll<{ service_price_id: string | null }>(
    "appointments",
    "service_price_id",
  );
  const appointmentServiceReferences = await selectAll<{ service_price_id: string | null }>(
    "appointment_services",
    "service_price_id",
  ).catch(() => []);

  const referencedIds = new Set<string>();
  for (const reference of [...appointmentReferences, ...appointmentServiceReferences]) {
    if (reference.service_price_id) referencedIds.add(reference.service_price_id);
  }

  const groups = new Map<string, ServicePriceRow[]>();
  for (const row of servicePrices) {
    const key = [
      normalize(row.service_name),
      row.billing_type,
      row.hair_type || "",
      row.size_category,
    ].join("|");
    groups.set(key, [...(groups.get(key) || []), row]);
  }

  for (const rows of groups.values()) {
    const keep = rows
      .slice()
      .sort((a, b) => {
        const referenceDiff = Number(referencedIds.has(b.id)) - Number(referencedIds.has(a.id));
        if (referenceDiff) return referenceDiff;
        const carolDiff = Number(b.company_id === carolCompanyId) - Number(a.company_id === carolCompanyId);
        if (carolDiff) return carolDiff;
        return String(b.updated_at || "").localeCompare(String(a.updated_at || ""));
      })[0];

    const duplicates = rows.filter((row) => row.id !== keep.id);
    for (const duplicate of duplicates) {
      if (referencedIds.has(duplicate.id)) {
        await must(
          supabase
            .from("appointments")
            .update({ service_price_id: keep.id })
            .eq("service_price_id", duplicate.id),
          `rewire appointments service_price ${duplicate.id}`,
        );
        await must(
          supabase
            .from("appointment_services")
            .update({ service_price_id: keep.id })
            .eq("service_price_id", duplicate.id),
          `rewire appointment_services service_price ${duplicate.id}`,
        ).catch((error) => {
          if (!isMissingTableOrColumn(String(error.message))) throw error;
        });
      }
    }

    const duplicateIds = duplicates.map((row) => row.id);
    if (duplicateIds.length > 0) {
      await must(supabase.from("service_prices").delete().in("id", duplicateIds), "delete duplicate service_prices");
    }
  }

  await updateCompanyId("service_prices", carolCompanyId);
}

async function normalizeCarolPackageTypes(carolCompanyId: string) {
  await must(
    supabase.from("package_types").update({ active: false }).eq("company_id", carolCompanyId),
    "deactivate old package_types",
  );

  for (const packageType of CAROL_PACKAGE_TYPES) {
    const { data, error } = await supabase
      .from("package_types")
      .select("id")
      .eq("company_id", carolCompanyId)
      .eq("name", packageType.name)
      .order("created_at", { ascending: true });
    if (error) throw new Error(`read package type ${packageType.name}: ${error.message}`);

    const [keep, ...duplicates] = data || [];
    if (keep) {
      await must(
        supabase
          .from("package_types")
          .update({ ...packageType, active: true })
          .eq("id", keep.id),
        `update package type ${packageType.name}`,
      );
      if (duplicates.length > 0) {
        await must(
          supabase
            .from("package_types")
            .update({ active: false })
            .in("id", duplicates.map((item) => item.id)),
          `deactivate duplicate package type ${packageType.name}`,
        );
      }
    } else {
      await must(
        supabase.from("package_types").insert({
          company_id: carolCompanyId,
          ...packageType,
          active: true,
        }),
        `insert package type ${packageType.name}`,
      );
    }
  }
}

async function updateCompanyId(table: string, companyId: string) {
  const { error } = await supabase.from(table).update({ company_id: companyId }).neq("company_id", companyId);
  if (error && !isMissingTableOrColumn(error.message)) {
    throw new Error(`move ${table}: ${error.message}`);
  }
}

async function moveUsers(adminCompanyId: string, carolCompanyId: string) {
  const { data: authUsers, error } = await supabase.auth.admin.listUsers();
  if (error) throw new Error(`list auth users: ${error.message}`);

  for (const authUser of authUsers.users) {
    const role = authUser.user_metadata?.role === "admin" ? "admin" : "company_admin";
    const companyId = role === "admin" ? adminCompanyId : carolCompanyId;

    await must(
      supabase.from("users").upsert(
        {
          id: authUser.id,
          email: authUser.email || "",
          role,
          company_id: companyId,
        },
        { onConflict: "id" },
      ),
      `upsert user ${authUser.email}`,
    );
  }
}

async function removeOtherAuthUsers() {
  const { data: appUsers } = await supabase.from("users").select("id");
  const keepIds = new Set((appUsers || []).map((user) => user.id));
  const { data: authUsers, error } = await supabase.auth.admin.listUsers();
  if (error) throw new Error(`list auth users: ${error.message}`);

  for (const authUser of authUsers.users) {
    if (!keepIds.has(authUser.id)) {
      const { error: deleteError } = await supabase.auth.admin.deleteUser(authUser.id);
      if (deleteError) throw new Error(`delete auth user ${authUser.email}: ${deleteError.message}`);
    }
  }
}

async function deleteNonTargetRows(keepCompanyIds: string[]) {
  const keepCompanyFilter = `(${keepCompanyIds.join(",")})`;

  await deleteAppointmentServicesOutsideCompanies(keepCompanyIds);

  for (const table of DELETE_TABLES) {
    if (table === "appointment_services") continue;
    if (table === "users") {
      await must(supabase.from(table).delete().not("company_id", "in", keepCompanyFilter), `delete ${table}`);
      continue;
    }
    if (table === "companies") {
      await must(supabase.from(table).delete().not("id", "in", keepCompanyFilter), `delete ${table}`);
      continue;
    }
    await deleteRowsOutsideCompanies(table, keepCompanyFilter);
  }
}

async function deleteRowsOutsideCompanies(table: string, keepCompanyFilter: string) {
  const { error } = await supabase.from(table).delete().not("company_id", "in", keepCompanyFilter);
  if (error && !isMissingTableOrColumn(error.message)) {
    throw new Error(`delete ${table}: ${error.message}`);
  }
}

async function deleteAppointmentServicesOutsideCompanies(keepCompanyIds: string[]) {
  const { data: appointments, error } = await supabase
    .from("appointments")
    .select("id")
    .in("company_id", keepCompanyIds);
  if (error && !isMissingTableOrColumn(error.message)) {
    throw new Error(`read appointments for appointment_services cleanup: ${error.message}`);
  }
  if (error) return;

  const keepAppointmentIds = (appointments || []).map((appointment) => appointment.id);
  if (keepAppointmentIds.length === 0) {
    await must(supabase.from("appointment_services").delete().neq("appointment_id", "00000000-0000-0000-0000-000000000000"), "delete appointment_services");
    return;
  }

  await must(
    supabase.from("appointment_services").delete().not("appointment_id", "in", `(${keepAppointmentIds.join(",")})`),
    "delete appointment_services outside target appointments",
  );
}

async function countByCompany(companies: Company[]) {
  const result: Record<string, Record<string, number>> = {};
  for (const company of companies) {
    result[company.id] = {};
    for (const table of BUSINESS_TABLES) {
      result[company.id][table] = await countTable(table, company.id);
    }
  }
  return result;
}

async function countTable(table: string, companyId: string) {
  const { count, error } = await supabase
    .from(table)
    .select("id", { count: "exact", head: true })
    .eq("company_id", companyId);
  if (error && isMissingTableOrColumn(error.message)) return 0;
  if (error) throw new Error(`count ${table}: ${error.message}`);
  return count || 0;
}

async function selectAll<T>(table: string, columns: string) {
  const { data, error } = await supabase.from(table).select(columns);
  if (error) throw new Error(`select ${table}: ${error.message}`);
  return (data || []) as T[];
}

async function must<T>(request: PromiseLike<{ data: T | null; error: { message: string } | null }>, label: string) {
  const { error } = await request;
  if (error) throw new Error(`${label}: ${error.message}`);
}

function printCurrentState(
  companies: Company[],
  users: Array<{ email: string; role: string; company_id: string | null }>,
  counts: Record<string, Record<string, number>>,
) {
  console.log("\nCompanies");
  for (const company of companies) {
    const companyCounts = counts[company.id] || {};
    const summary = BUSINESS_TABLES.map((table) => `${table}:${companyCounts[table] || 0}`).join(" ");
    console.log(`- ${company.name} <${company.email}> ${company.id}`);
    console.log(`  ${summary}`);
  }

  console.log("\nUsers");
  for (const user of users) {
    console.log(`- ${user.email} role=${user.role} company_id=${user.company_id}`);
  }
}

function isMissingTableOrColumn(message: string) {
  return (
    message.includes("does not exist") ||
    message.includes("Could not find the table") ||
    message.includes("Could not find the") ||
    message.includes("schema cache")
  );
}

function normalize(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

function loadEnvFile(path: string) {
  if (!existsSync(path)) return;
  const lines = readFileSync(path, "utf8").split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const separator = trimmed.indexOf("=");
    if (separator === -1) continue;
    const key = trimmed.slice(0, separator);
    const value = trimmed.slice(separator + 1);
    process.env[key] ||= value;
  }
}
