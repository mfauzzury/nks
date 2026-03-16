import { createRouter, createWebHistory } from "vue-router";

import DashboardView from "@/views/DashboardView.vue";
import MainDashboardView from "@/views/MainDashboardView.vue";
import KitchenChartsView from "@/views/KitchenChartsView.vue";
import KitchenFormsView from "@/views/KitchenFormsView.vue";
import LoginView from "@/views/LoginView.vue";
import MediaLibraryView from "@/views/MediaLibraryView.vue";
import KitchenSinkView from "@/views/KitchenSinkView.vue";
import PageEditorView from "@/views/PageEditorView.vue";
import PagesListView from "@/views/PagesListView.vue";
import PostEditorView from "@/views/PostEditorView.vue";
import PostsListView from "@/views/PostsListView.vue";
import CategoriesListView from "@/views/CategoriesListView.vue";
import CategoryEditorView from "@/views/CategoryEditorView.vue";
import DatabaseSchemaView from "@/views/DatabaseSchemaView.vue";
import ApiManagementView from "@/views/ApiManagementView.vue";
import MenusView from "@/views/MenusView.vue";
import RolesView from "@/views/RolesView.vue";
import SettingsView from "@/views/SettingsView.vue";
import SystemInfoView from "@/views/SystemInfoView.vue";
import UsersView from "@/views/UsersView.vue";
import UserEditView from "@/views/UserEditView.vue";
import PayersListView from "@/views/PayersListView.vue";
import PayerDetailView from "@/views/PayerDetailView.vue";
import PayerIndividualRegistrationView from "@/views/PayerIndividualRegistrationView.vue";
import PayerCorporateRegistrationView from "@/views/PayerCorporateRegistrationView.vue";
import SpgEmployerRegistrationView from "@/views/SpgEmployerRegistrationView.vue";
import PayerIndividualListView from "@/views/PayerIndividualListView.vue";
import PayerCorporateListView from "@/views/PayerCorporateListView.vue";
import PayerSpgListView from "@/views/PayerSpgListView.vue";
import SpgEmployeesView from "@/views/SpgEmployeesView.vue";
import DuplicateCasesView from "@/views/DuplicateCasesView.vue";
import DuplicateCaseDetailView from "@/views/DuplicateCaseDetailView.vue";
import AccountDetectionMergeView from "@/views/AccountDetectionMergeView.vue";
import AccountReconciliationQueueView from "@/views/AccountReconciliationQueueView.vue";
import ZakatTypesView from "@/views/ZakatTypesView.vue";
import PaymentGatewaysView from "@/views/PaymentGatewaysView.vue";
import SourceCategoriesView from "@/views/SourceCategoriesView.vue";
import SumberDataListView from "@/views/SumberDataListView.vue";
import SumberDataEditorView from "@/views/SumberDataEditorView.vue";
import ZakatTypeEditorView from "@/views/ZakatTypeEditorView.vue";
import SpgPendingBatchesView from "@/views/SpgPendingBatchesView.vue";
import SpgPendingBatchDetailView from "@/views/SpgPendingBatchDetailView.vue";
import IntegrationOverviewView from "@/views/integration/IntegrationOverviewView.vue";
import IntegrationFileUploadView from "@/views/integration/IntegrationFileUploadView.vue";
import IntegrationBatchProcessingView from "@/views/integration/IntegrationBatchProcessingView.vue";
import IntegrationReconciliationView from "@/views/integration/IntegrationReconciliationView.vue";
import IntegrationReconciliationRunDetailView from "@/views/integration/IntegrationReconciliationRunDetailView.vue";
import IntegrationExceptionsView from "@/views/integration/IntegrationExceptionsView.vue";
import IntegrationReportsView from "@/views/integration/IntegrationReportsView.vue";
import IntegrationAmilListView from "@/views/integration/IntegrationAmilListView.vue";
import IntegrationAmilDetailView from "@/views/integration/IntegrationAmilDetailView.vue";
import IntegrationAmilEditView from "@/views/integration/IntegrationAmilEditView.vue";
import CounterPaymentsListView from "@/views/CounterPaymentsListView.vue";
import CounterDepositsView from "@/views/CounterDepositsView.vue";
import CounterReconciliationView from "@/views/CounterReconciliationView.vue";
import CounterPosView from "@/views/CounterPosView.vue";
import ScheduledPaymentsView from "@/views/ScheduledPaymentsView.vue";
import StorefrontHomeView from "@/views/StorefrontHomeView.vue";
import StorefrontMenuView from "@/views/StorefrontMenuView.vue";
import StorefrontPageView from "@/views/StorefrontPageView.vue";
import WebfrontSettingsView from "@/views/WebfrontSettingsView.vue";
import { useAuthStore } from "@/stores/auth";
import { useSiteStore } from "@/stores/site";

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: "/login", name: "login", component: LoginView, meta: { guestOnly: true, title: "Login" } },
    { path: "/", name: "main-dashboard", component: MainDashboardView, meta: { requiresAuth: true, title: "Main Dashboard" } },
    { path: "/portal/dashboard", name: "dashboard", component: DashboardView, meta: { requiresAuth: true, title: "Portal Dashboard" } },
    { path: "/posts", name: "posts", component: PostsListView, meta: { requiresAuth: true, title: "Posts" } },
    { path: "/posts/new", name: "post-create", component: PostEditorView, meta: { requiresAuth: true, title: "New Post" } },
    { path: "/posts/:id", name: "post-edit", component: PostEditorView, meta: { requiresAuth: true, title: "Edit Post" } },
    { path: "/categories", name: "categories", component: CategoriesListView, meta: { requiresAuth: true, title: "Categories" } },
    { path: "/categories/new", name: "category-create", component: CategoryEditorView, meta: { requiresAuth: true, title: "New Category" } },
    { path: "/categories/:id", name: "category-edit", component: CategoryEditorView, meta: { requiresAuth: true, title: "Edit Category" } },
    { path: "/pages", name: "pages", component: PagesListView, meta: { requiresAuth: true, title: "Pages" } },
    { path: "/pages/new", name: "page-create", component: PageEditorView, meta: { requiresAuth: true, title: "New Page" } },
    { path: "/pages/:id", name: "page-edit", component: PageEditorView, meta: { requiresAuth: true, title: "Edit Page" } },
    { path: "/media", name: "media", component: MediaLibraryView, meta: { requiresAuth: true, title: "Media" } },
    { path: "/payers", name: "payers", component: PayersListView, meta: { requiresAuth: true, title: "Payers" } },
    { path: "/payers/individual/list", name: "payer-individual-list", component: PayerIndividualListView, meta: { requiresAuth: true, title: "Individu - Senarai" } },
    { path: "/payers/individual/new", name: "payer-individual-create", component: PayerIndividualRegistrationView, meta: { requiresAuth: true, title: "Daftar Individu" } },
    { path: "/payers/corporate/list", name: "payer-corporate-list", component: PayerCorporateListView, meta: { requiresAuth: true, title: "Korporat - Senarai" } },
    { path: "/payers/corporate/new", name: "payer-corporate-create", component: PayerCorporateRegistrationView, meta: { requiresAuth: true, title: "Daftar Korporat" } },
    { path: "/payers/spg/list", name: "payer-spg-list", component: PayerSpgListView, meta: { requiresAuth: true, title: "SPG - Senarai" } },
    { path: "/payers/spg/new", name: "payer-spg-create", component: SpgEmployerRegistrationView, meta: { requiresAuth: true, title: "Daftar SPG" } },
    { path: "/payers/:id", name: "payer-detail", component: PayerDetailView, meta: { requiresAuth: true, title: "Profil Pembayar" } },
    { path: "/spg/employers/:payerId/employees", name: "spg-employees", component: SpgEmployeesView, meta: { requiresAuth: true, title: "SPG Employees" } },
    { path: "/spg/payments/pending", name: "spg-payments-pending", component: SpgPendingBatchesView, meta: { requiresAuth: true, title: "SPG Pending Payment" } },
    { path: "/spg/payments/:batchId", name: "spg-payments-detail", component: SpgPendingBatchDetailView, meta: { requiresAuth: true, title: "SPG Batch Detail" } },
    { path: "/counter/payments", name: "counter-payments", component: CounterPaymentsListView, meta: { requiresAuth: true, title: "Senarai Kutipan Kaunter" } },
    { path: "/counter/deposits", name: "counter-deposits", component: CounterDepositsView, meta: { requiresAuth: true, title: "Konsolidasi Bank-In" } },
    { path: "/counter/reconciliation", name: "counter-reconciliation", component: CounterReconciliationView, meta: { requiresAuth: true, title: "Rekonsiliasi Bank" } },
    { path: "/counter/pos", name: "counter-pos", component: CounterPosView, meta: { requiresAuth: true, title: "POS Kaunter" } },
    { path: "/scheduled-payments", name: "scheduled-payments", component: ScheduledPaymentsView, meta: { requiresAuth: true, title: "Penjadualan Bayaran" } },
    { path: "/duplicates", name: "duplicates", component: DuplicateCasesView, meta: { requiresAuth: true, title: "Duplicate Cases" } },
    { path: "/duplicates/:id", name: "duplicate-detail", component: DuplicateCaseDetailView, meta: { requiresAuth: true, title: "Duplicate Case Detail" } },
    { path: "/reconciliation/queue", redirect: "/reconciliation/account-merge/queue" },
    { path: "/reconciliation/account-merge/queue", name: "reconciliation-queue", component: AccountReconciliationQueueView, meta: { requiresAuth: true, title: "Reconciliation Queue" } },
    { path: "/reconciliation/account-merge", name: "account-merge", component: AccountDetectionMergeView, meta: { requiresAuth: true, title: "Account Detection & Merge" } },
    { path: "/zakat-config/types", name: "zakat-types", component: ZakatTypesView, meta: { requiresAuth: true, title: "Jenis Zakat" } },
    { path: "/zakat-config/types/:code", name: "zakat-types-edit", component: ZakatTypeEditorView, meta: { requiresAuth: true, title: "Edit Jenis Zakat" } },
    { path: "/zakat-config/payment-gateways", name: "zakat-payment-gateways", component: PaymentGatewaysView, meta: { requiresAuth: true, title: "Gerbang Pembayaran" } },
    { path: "/zakat-config/source-categories", name: "zakat-source-categories", component: SourceCategoriesView, meta: { requiresAuth: true, title: "Kategori Sumber" } },
    { path: "/zakat-config/source-data", name: "zakat-source-data", component: SumberDataListView, meta: { requiresAuth: true, title: "Sumber Data" } },
    { path: "/zakat-config/source-data/:code", name: "zakat-source-data-edit", component: SumberDataEditorView, meta: { requiresAuth: true, title: "Edit Sumber Data" } },
    { path: "/integration/3rd-party", name: "integration-3rd-party", component: IntegrationOverviewView, meta: { requiresAuth: true, title: "Integration 3rd Party - Overview" } },
    { path: "/integration/3rd-party/file-upload", name: "integration-file-upload", component: IntegrationFileUploadView, meta: { requiresAuth: true, title: "Integration 3rd Party - File Upload" } },
    { path: "/integration/3rd-party/batch-processing", name: "integration-batch-processing", component: IntegrationBatchProcessingView, meta: { requiresAuth: true, title: "Integration 3rd Party - Batch Processing" } },
    { path: "/integration/3rd-party/reconciliation", name: "integration-reconciliation", component: IntegrationReconciliationView, meta: { requiresAuth: true, title: "Integration 3rd Party - Reconciliation" } },
    { path: "/integration/3rd-party/reconciliation/:fileId", name: "integration-reconciliation-detail", component: IntegrationReconciliationRunDetailView, meta: { requiresAuth: true, title: "Reconciliation Run Detail" } },
    { path: "/integration/3rd-party/exceptions", name: "integration-exceptions", component: IntegrationExceptionsView, meta: { requiresAuth: true, title: "Integration 3rd Party - Exceptions" } },
    { path: "/integration/3rd-party/reports", name: "integration-reports", component: IntegrationReportsView, meta: { requiresAuth: true, title: "Integration 3rd Party - Reports" } },
    { path: "/integration/3rd-party/amil", name: "integration-amil-list", component: IntegrationAmilListView, meta: { requiresAuth: true, title: "Integration 3rd Party - Amil" } },
    { path: "/integration/3rd-party/amil/:id/edit", name: "integration-amil-edit", component: IntegrationAmilEditView, meta: { requiresAuth: true, title: "Integration 3rd Party - Edit Amil" } },
    { path: "/integration/3rd-party/amil/:id", name: "integration-amil-detail", component: IntegrationAmilDetailView, meta: { requiresAuth: true, title: "Integration 3rd Party - View Amil" } },
    { path: "/menus", name: "menus", component: MenusView, meta: { requiresAuth: true, title: "Menus" } },
    { path: "/kitchen-sink", name: "kitchen-sink", component: KitchenSinkView, meta: { requiresAuth: true, title: "Kitchen Sink" } },
    { path: "/kitchen-sink/forms", name: "kitchen-forms", component: KitchenFormsView, meta: { requiresAuth: true, title: "Forms" } },
    { path: "/kitchen-sink/charts", name: "kitchen-charts", component: KitchenChartsView, meta: { requiresAuth: true, title: "Charts" } },
    { path: "/development/database-schema", name: "database-schema", component: DatabaseSchemaView, meta: { requiresAuth: true, title: "Database Schema" } },
    { path: "/development/api-management", name: "api-management", component: ApiManagementView, meta: { requiresAuth: true, title: "API Management" } },
    {
      path: "/profile",
      name: "profile",
      meta: { requiresAuth: true },
      beforeEnter: async () => {
        const auth = useAuthStore();
        await auth.initialize();
        if (auth.user?.id) return `/settings/users/${auth.user.id}`;
        return { name: "login" };
      },
      component: { template: "" },
    },
    { path: "/settings", name: "settings", component: SettingsView, meta: { requiresAuth: true, title: "Settings" } },
    { path: "/settings/webfront", name: "webfront-settings", component: WebfrontSettingsView, meta: { requiresAuth: true, title: "Webfront Settings" } },
    { path: "/storefront", name: "storefront-home", component: StorefrontHomeView, meta: { title: "Storefront" } },
    { path: "/storefront/menu", name: "storefront-menu", component: StorefrontMenuView, meta: { title: "Storefront Menu" } },
    { path: "/storefront/page/:slug", name: "storefront-page", component: StorefrontPageView, meta: { title: "Storefront Page" } },
    { path: "/settings/users", name: "settings-users", component: UsersView, meta: { requiresAuth: true, title: "Users" } },
    { path: "/settings/users/new", name: "user-create", component: UserEditView, meta: { requiresAuth: true, title: "New User" } },
    { path: "/settings/users/:id", name: "user-edit", component: UserEditView, meta: { requiresAuth: true, title: "Edit User" } },
    { path: "/settings/roles", name: "settings-roles", component: RolesView, meta: { requiresAuth: true, title: "Roles" } },
    { path: "/settings/system", name: "settings-system", component: SystemInfoView, meta: { requiresAuth: true, title: "System Info" } },
  ],
});

router.beforeEach(async (to) => {
  const auth = useAuthStore();
  await auth.initialize();

  if (to.meta.requiresAuth && !auth.isAuthenticated) {
    return { name: "login" };
  }

  if (to.meta.guestOnly && auth.isAuthenticated) {
    return { name: "main-dashboard" };
  }

  return true;
});

router.afterEach((to) => {
  const site = useSiteStore();
  const pageTitle = (to.meta.title as string) || "Admin";
  site.setDocumentTitle(pageTitle);
});

export default router;
