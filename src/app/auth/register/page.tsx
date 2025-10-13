import { RegisterForm } from "./components/register-form"
import { Logo } from "@/components/logo"
import Link from "next/link"

export default function RegisterPage() {
  return (
    <div className="bg-muted flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
      <div className="flex w-full max-w-xl flex-col gap-6">
        <Link href="/landing" className="flex items-center gap-2 self-center font-medium">
          <div className="bg-primary text-primary-foreground flex size-9 items-center justify-center rounded-md">
            <Logo size={24} />
          </div>
          Moday
        </Link>
        <RegisterForm />
      </div>
    </div>
  )
}
