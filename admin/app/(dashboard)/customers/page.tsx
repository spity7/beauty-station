import { ApiCustomersPanel } from "@/components/customers/api-customers-panel";
import { PageHeader } from "@/components/layout/page-header";

export default function CustomersPage() {
  return (
    <>
      <PageHeader
        description="Review customer accounts, order activity, and enable or disable access."
        eyebrow="CRM"
        title="Customers"
      />
      <ApiCustomersPanel />
    </>
  );
}
