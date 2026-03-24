import { cookies } from 'next/headers'
import { ImpersonationBanner } from '@/components/admin/ImpersonationBanner'
import { getCompanyForImpersonation } from '@/lib/actions/admin'

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const cookieStore = await cookies()
  const impersonateCompanyId = cookieStore.get('impersonate_company_id')?.value

  let companyName: string | null = null
  if (impersonateCompanyId) {
    const result = await getCompanyForImpersonation(impersonateCompanyId)
    companyName = result.data?.name || null
  }

  return (
    <>
      {companyName && <ImpersonationBanner companyName={companyName} />}
      <div className={companyName ? 'pt-12' : ''}>
        {children}
      </div>
    </>
  )
}
