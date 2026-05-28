import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

type PackageType = {
  id: string;
  name: string;
  interval_days: number;
  credits: number;
};

type PetPackage = {
  id: string;
  company_id: string;
  pet_id: string;
  credits_remaining: number;
  active: boolean;
  package_type: PackageType | PackageType[];
  pet: { id: string; name: string } | { id: string; name: string }[];
};

type Appointment = {
  id: string;
  company_id: string;
  client_id: string;
  pet_id: string;
  service_price_id: string | null;
  date: string;
  time: string;
  price: number;
  total_price: number | null;
  status: "scheduled" | "completed" | "cancelled";
  used_credit: boolean;
  client_plan_id: string | null;
  pet_package_id: string | null;
  notes: string | null;
};

type AppointmentService = {
  appointment_id: string;
  service_price_id: string;
  price: number;
};

function loadEnv() {
  const envPath = resolve(process.cwd(), ".env.local");
  const content = readFileSync(envPath, "utf8");

  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;

    const separatorIndex = trimmed.indexOf("=");
    if (separatorIndex === -1) continue;

    const key = trimmed.slice(0, separatorIndex);
    const value = trimmed.slice(separatorIndex + 1);
    process.env[key] ||= value;
  }
}

function one<T>(value: T | T[]) {
  return Array.isArray(value) ? value[0] : value;
}

function formatDateInput(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function addDays(date: Date, days: number) {
  const nextDate = new Date(date);
  nextDate.setDate(nextDate.getDate() + days);
  return nextDate;
}

function addMonthsClamped(date: Date, months: number) {
  const year = date.getFullYear();
  const month = date.getMonth() + months;
  const day = date.getDate();
  const lastDayOfTargetMonth = new Date(year, month + 1, 0).getDate();

  return new Date(year, month, Math.min(day, lastDayOfTargetMonth));
}

function buildPackageAppointmentDates(
  startDateInput: string,
  intervalDays: number,
  count: number,
) {
  const [year, month, day] = startDateInput.split("-").map(Number);
  const startDate = new Date(year, month - 1, day);

  return Array.from({ length: count }, (_, index) => {
    const date =
      intervalDays === 30
        ? addMonthsClamped(startDate, index)
        : addDays(startDate, (intervalDays === 15 ? 14 : intervalDays) * index);

    return formatDateInput(date);
  });
}

async function main() {
  loadEnv();

  const apply = process.argv.includes("--apply");
  const packageIdArg = process.argv.find((arg) => arg.startsWith("--package-id="));
  const onlyPackageId = packageIdArg?.split("=")[1];

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false },
  });

  let packagesQuery = supabase
    .from("pet_packages")
    .select(`
      id,
      company_id,
      pet_id,
      credits_remaining,
      active,
      package_type:package_types!inner(id, name, interval_days, credits),
      pet:pets!inner(id, name)
    `)
    .eq("active", true)
    .order("created_at", { ascending: true });

  if (onlyPackageId) {
    packagesQuery = packagesQuery.eq("id", onlyPackageId);
  }

  const { data: packages, error: packagesError } = await packagesQuery;
  if (packagesError) throw packagesError;

  let changedPackages = 0;

  for (const petPackage of (packages || []) as PetPackage[]) {
    const packageType = one(petPackage.package_type);
    const pet = one(petPackage.pet);

    const { data: appointments, error: appointmentsError } = await supabase
      .from("appointments")
      .select("*")
      .eq("pet_package_id", petPackage.id)
      .order("date", { ascending: true })
      .order("time", { ascending: true });

    if (appointmentsError) throw appointmentsError;
    if (!appointments || appointments.length === 0) continue;

    const anchor = appointments[0] as Appointment;
    const { data: services, error: servicesError } = await supabase
      .from("appointment_services")
      .select("appointment_id, service_price_id, price")
      .eq("appointment_id", anchor.id);

    if (servicesError) throw servicesError;
    if (!services || services.length === 0) {
      console.log(`SKIP ${pet.name} (${packageType.name}): agendamento base sem servicos`);
      continue;
    }

    const serviceCount = services.length;
    const appointmentCount = Math.floor(packageType.credits / serviceCount);
    const dates = buildPackageAppointmentDates(
      anchor.date,
      packageType.interval_days,
      appointmentCount,
    );

    console.log("");
    console.log(`${apply ? "APPLY" : "DRY"} ${pet.name} - ${packageType.name}`);
    console.log(`package_id: ${petPackage.id}`);
    console.log(`base: ${anchor.date} ${anchor.time}`);
    console.log(`servicos_por_agendamento: ${serviceCount}`);
    console.log(`agendamentos_atuais: ${appointments.length}`);
    console.log(`agendamentos_recriados: ${dates.length}`);
    console.log(`datas: ${dates.join(", ")}`);

    if (!apply) continue;

    const existingIds = appointments.map((appointment) => appointment.id);
    const rows = dates.map((date) => ({
      company_id: anchor.company_id,
      client_id: anchor.client_id,
      pet_id: anchor.pet_id,
      service_price_id: anchor.service_price_id,
      date,
      time: anchor.time,
      price: anchor.price,
      total_price: anchor.total_price,
      status: "scheduled",
      used_credit: true,
      client_plan_id: null,
      pet_package_id: petPackage.id,
      notes: anchor.notes,
    }));

    const { data: insertedAppointments, error: insertError } = await supabase
      .from("appointments")
      .insert(rows)
      .select("id");

    if (insertError || !insertedAppointments) {
      throw insertError || new Error(`Failed to insert appointments for ${petPackage.id}`);
    }

    const insertedServices = insertedAppointments.flatMap((appointment) =>
      (services as AppointmentService[]).map((service) => ({
        appointment_id: appointment.id,
        service_price_id: service.service_price_id,
        price: service.price,
      })),
    );

    const { error: servicesInsertError } = await supabase
      .from("appointment_services")
      .insert(insertedServices);

    if (servicesInsertError) {
      await supabase
        .from("appointments")
        .delete()
        .in("id", insertedAppointments.map((appointment) => appointment.id));
      throw servicesInsertError;
    }

    const { error: oldServicesDeleteError } = await supabase
      .from("appointment_services")
      .delete()
      .in("appointment_id", existingIds);
    if (oldServicesDeleteError) throw oldServicesDeleteError;

    const { error: oldAppointmentsDeleteError } = await supabase
      .from("appointments")
      .delete()
      .in("id", existingIds);
    if (oldAppointmentsDeleteError) throw oldAppointmentsDeleteError;

    const usedCredits = dates.length * serviceCount;
    const { error: packageUpdateError } = await supabase
      .from("pet_packages")
      .update({
        credits_remaining: Math.max(0, packageType.credits - usedCredits),
        active: packageType.credits - usedCredits > 0,
      })
      .eq("id", petPackage.id);

    if (packageUpdateError) throw packageUpdateError;
    changedPackages += 1;
  }

  console.log("");
  console.log(`${apply ? "Pacotes recadastrados" : "Pacotes que seriam recadastrados"}: ${changedPackages}`);
  if (!apply) {
    console.log("Nenhuma alteracao foi feita. Rode com --apply para executar.");
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
