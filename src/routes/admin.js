import {
	Dashboard,
	DashboardTwo,
	// Account Screens
	Journal,
	CreateJournal,
	DetailJournal,
	OpeningBalance,
	CreateOpeningBalance,
	DetailOpeningBalance,

	// Bank Screens
	BankAccount,
	CreateBankAccount,
	DetailBankAccount,
	BankTransactions,
	CreateBankTransaction,
	DetailBankTransaction,
	ReconcileTransaction,
	ImportBankStatement,
	ImportTransaction,

	// Customer Screens
	CustomerInvoice,
	CreateCustomerInvoice,
	DetailCustomerInvoice,
	ViewCustomerInvoice,
	RecordCustomerPayment,

	// Receipt Screens
	Receipt,
	CreateReceipt,
	DetailReceipt,

	// SupplierInvoice Screens
	SupplierInvoice,
	CreateSupplierInvoice,
	DetailSupplierInvoice,
	ViewInvoice,
	RecordSupplierPayment,

	// Expense Screens
	Expense,
	CreateExpense,
	DetailExpense,
	Payment,
	CreatePayment,
	DetailPayment,

	// Vat Screens
	VatTransactions,
	ReportsFiling,

	// Report Screens
	TransactionsReport,
	FinancialReport,
	DetailedGeneralLedgerReport,

	// Master Screens
	ChartAccount,
	CreateChartAccount,
	DetailChartAccount,
	Contact,
	CreateContact,
	DetailContact,
	Employee,
	CreateEmployee,
	DetailEmployee,
	Product,
	CreateProduct,
	DetailProduct,
	InventoryEdit,
	Project,
	CreateProject,
	DetailProject,
	VatCode,
	CreateVatCode,
	DetailVatCode,
	CurrencyConvert,
	CreateCurrencyConvert,
	DetailCurrencyConvert,

	// Product Screens
	ProductCategory,
	CreateProductCategory,
	DetailProductCategory,

	// Currency Screens
	Currency,
	CreateCurrency,
	DetailCurrency,

	// User Screens
	User,
	CreateUser,
	DetailUser,
	Organization,

	// Profile Screens
	Profile,
	GeneralSettings,
	// TransactionCategory,
	// CreateTransactionCategory,
	// DetailTransactionCategory,
	UsersRoles,
	CreateRole,
	UpdateRole,
	Notification,
	DataBackup,
	Help,
	Faq,
	ViewExpense,

	Inventory,
	Template
} from 'screens';

const adminRoutes = [
	{
		path: '/admin/dashboard',
		name: 'Dashboard',
		component: Dashboard.screen,
	},
	{
		path: '/admin/dashboard-two',
		name: 'DashboardTwo',
		component: DashboardTwo,
	},
	{
		path: '/admin/accountant/journal/create',
		name: 'AddJournal',
		component: CreateJournal.screen,
	},
	{
		path: '/admin/accountant/journal/detail',
		name: 'UpdateJournal',
		component: DetailJournal.screen,
	},
	{
		path: '/admin/accountant/journal',
		name: 'ViewJournal',
		component: Journal.screen,
	},
	{
		path: '/admin/accountant/opening-balance',
		name: 'ViewOpeningBalance',
		component: OpeningBalance.screen,
	},
	{
		path: '/admin/accountant/opening-balance/create',
		name: 'AddOpeningBalance',
		component: CreateOpeningBalance.screen,
	},
	{
		path: '/admin/accountant/opening-balance/detail',
		name: 'UpdateOpeningBalance',
		component: DetailOpeningBalance.screen,
	},
	{

		path: '/admin/Inventory',
		name: 'Inventory',
		component: Inventory.screen,
	},
	{
		path: '/admin/settings/template',
		name: 'ViewUser',
		component: Template.screen,
	},
	{
		redirect: true,
		path: '/admin/accountant',
		pathTo: '/admin/accountant/opening-balance',
		name: 'Accountant',
	},

	{
		path: '/admin/banking/bank-account/transaction/create',
		name: 'AddTransaction',
		component: CreateBankTransaction.screen,
	},
	{
		path: '/admin/banking/bank-account/transaction/detail',
		name: 'UpdateTransaction',
		component: DetailBankTransaction.screen,
	},
	{
		path: '/admin/banking/bank-account/transaction/reconcile',
		name: 'ViewReconcile',
		component: ReconcileTransaction.screen,
	},
	{
		path: '/admin/banking/bank-account/transaction',
		name: 'ViewTransaction',
		component: BankTransactions.screen,
	},
	{
		path: '/admin/banking/bank-account/create',
		name: 'AddBankAccount',
		component: CreateBankAccount.screen,
	},
	{
		path: '/admin/banking/bank-account/detail',
		name: 'UpdateBankAccount',
		component: DetailBankAccount.screen,
	},
	{
		path: '/admin/banking/bank-account',
		name: 'ViewBankAccount',
		component: BankAccount.screen,
	},
	{
		path: '/admin/banking/upload-statement/transaction',
		name: 'AddBankStatement',
		component: ImportTransaction.screen,
	},
	{
		path: '/admin/banking/upload-statement',
		name: 'AddBankStatement',
		component: ImportBankStatement.screen,
	},
	{
		redirect: true,
		path: '/admin/banking',
		pathTo: '/admin/banking/bank-account',
		name: 'Banking',
	},

	{
		path: '/admin/income/customer-invoice/create',
		name: 'AddCustomerInvoices',
		component: CreateCustomerInvoice.screen,
	},
	{
		path: '/admin/income/customer-invoice/view',
		name: 'ViewCustomerInvoices',
		component: ViewCustomerInvoice.screen,
	},
	{
		path: '/admin/income/customer-invoice/detail',
		name: 'UpdateCustomerInvoices',
		component: DetailCustomerInvoice.screen,
	},
	{
		path: '/admin/income/customer-invoice/record-payment',
		name: 'RecordCustomerPayment',
		component: RecordCustomerPayment.screen,
	},
	{
		path: '/admin/income/customer-invoice',
		name: 'ViewCustomerInvoices',
		component: CustomerInvoice.screen,
	},
	{
		path: '/admin/income/receipt/create',
		name: 'Create',
		component: CreateReceipt.screen,
	},
	{
		path: '/admin/income/receipt/detail',
		name: 'Detail',
		component: DetailReceipt.screen,
	},
	{
		path: '/admin/income/receipt',
		name: 'ViewIncomeReceipts',
		component: Receipt.screen,
	},
	{
		redirect: true,
		path: '/admin/income',
		pathTo: '/admin/income/customer-invoice',
		name: 'Income',
	},

	{
		path: '/admin/expense/supplier-invoice/create',
		name: 'AddSupplierInvoices',
		component: CreateSupplierInvoice.screen,
	},
	{
		path: '/admin/expense/supplier-invoice/view',
		name: 'ViewSupplierInvoices',
		component: ViewInvoice.screen,
	},
	{
		path: '/admin/expense/supplier-invoice/detail',
		name: 'UpdateSupplierInvoices',
		component: DetailSupplierInvoice.screen,
	},
	{
		path: '/admin/expense/supplier-invoice/record-payment',
		name: 'RecordSupplierPayment',
		component: RecordSupplierPayment.screen,
	},
	{
		path: '/admin/expense/supplier-invoice',
		name: 'ViewSupplierInvoices',
		component: SupplierInvoice.screen,
	},
	{
		path: '/admin/expense/expense/create',
		name: 'AddExpenses',
		component: CreateExpense.screen,
	},
	{
		path: '/admin/expense/expense/detail',
		name: 'UpdateExpenses',
		component: DetailExpense.screen,
	},
	{
		path: '/admin/expense/expense',
		name: 'ViewExpenses',
		component: Expense.screen,
	},
	{
		path: '/admin/expense/expense/view',
		name: 'ViewExpense',
		component: ViewExpense.screen,
	},
	{
		path: '/admin/expense/payment/create',
		name: 'AddPaymentReceipts',
		component: CreatePayment.screen,
	},
	{
		path: '/admin/expense/payment/detail',
		name: 'UpdatePaymentReceipts',
		component: DetailPayment.screen,
	},
	{
		path: '/admin/expense/purchase',
		name: 'ViewPaymentReceipts',
		component: Payment.screen,
	},
	{
		redirect: true,
		path: '/admin/expense',
		pathTo: '/admin/expense/expense',
		name: 'Expense',
	},

	{
		path: '/admin/taxes/vat-transactions',
		name: 'vatTransactions',
		component: VatTransactions.screen,
	},
	{
		path: '/admin/taxes/reports-filing',
		name: 'Reports Filing',
		component: ReportsFiling.screen,
	},
	{
		redirect: true,
		path: '/admin/taxes',
		pathTo: '/admin/taxes/vat-transactions',
		name: 'Taxes',
	},

	{
		path: '/admin/report/transactions',
		name: 'Transactions',
		component: TransactionsReport.screen,
	},
	{
		path: '/admin/report/financial',
		name: 'Financial',
		component: FinancialReport.screen,
	},
	{
		path: '/admin/report/detailed-general-ledger',
		name: 'DetailedGeneralLedger',
		component: DetailedGeneralLedgerReport.screen,
	},
	{
		redirect: true,
		path: '/admin/report',
		pathTo: '/admin/report/financial',
		name: 'Report',
	},

	{
		path: '/admin/master/chart-account/create',
		name: 'AddChartOfAccounts',
		component: CreateChartAccount.screen,
	},
	{
		path: '/admin/master/chart-account/detail',
		name: 'UpdateChartOfAccounts',
		component: DetailChartAccount.screen,
	},
	{
		path: '/admin/master/chart-account',
		name: 'ViewChartOfAccounts',
		component: ChartAccount.screen,
	},
	{
		path: '/admin/master/contact/create',
		name: 'AddContact',
		component: CreateContact.screen,
	},
	{
		path: '/admin/master/contact/detail',
		name: 'UpdateContact',
		component: DetailContact.screen,
	},
	{
		path: '/admin/master/contact',
		name: 'ViewContact',
		component: Contact.screen,
	},
	{
		path: '/admin/master/employee/create',
		name: 'Create',
		component: CreateEmployee.screen,
	},
	{
		path: '/admin/master/employee/detail',
		name: 'Detail',
		component: DetailEmployee.screen,
	},
	{
		path: '/admin/master/employee',
		name: 'Employee',
		component: Employee.screen,
	},
	{
		path: '/admin/master/product/create',
		name: 'AddProduct',
		component: CreateProduct.screen,
	},
	{
		path: '/admin/master/product/detail',
		name: 'UpdateProduct',
		component: DetailProduct.screen,
	},
	{
		path: '/admin/master/product/detail/inventoryedit',
		name: 'UpdateInventory',
		component: InventoryEdit.screen,
	},
	{
		path: '/admin/master/product',
		name: 'ViewProduct',
		component: Product.screen,
	},
	{
		path: '/admin/master/project/create',
		name: 'Create',
		component: CreateProject.screen,
	},
	{
		path: '/admin/master/project/detail',
		name: 'Detail',
		component: DetailProject.screen,
	},
	{
		path: '/admin/master/project',
		name: 'Project',
		component: Project.screen,
	},
	{
		path: '/admin/master/currencyConvert/create',
		name: 'CreateCurrencyConversion',
		component: CreateCurrencyConvert.screen,
	},
	{
		path: '/admin/master/currencyConvert/detail',
		name: 'UpdateCurrencyConversion',
		component: DetailCurrencyConvert.screen,
	},
	{
		path: '/admin/master/currencyConvert',
		name: 'ViewCurrencyConversion',
		component: CurrencyConvert.screen,
	},
	{
		path: '/admin/master/vat-category/create',
		name: 'AddVatCategory',
		component: CreateVatCode.screen,
	},
	{
		path: '/admin/master/vat-category/detail',
		name: 'UpdateVatCategory',
		component: DetailVatCode.screen,
	},
	{
		path: '/admin/master/vat-category',
		name: 'ViewVatCategory',
		component: VatCode.screen,
	},
	{
		path: '/admin/master/product-category/create',
		name: 'AddProductCategory',
		component: CreateProductCategory.screen,
	},
	{
		path: '/admin/master/product-category/detail',
		name: 'UpdateProductCategory',
		component: DetailProductCategory.screen,
	},
	{
		path: '/admin/master/product-category',
		name: 'ViewProductCategory',
		component: ProductCategory.screen,
	},
	{
		path: '/admin/master/currency/create',
		name: 'Create',
		component: CreateCurrency.screen,
	},
	{
		path: '/admin/master/currency/detail',
		name: 'Detail',
		component: DetailCurrency.screen,
	},
	{
		path: '/admin/master/currency',
		name: 'Currencies',
		component: Currency.screen,
	},
	{
		redirect: true,
		path: '/admin/master',
		pathTo: '/admin/master/chart-account',
		name: 'Master',
	},

	{
		path: '/admin/settings/user/create',
		name: 'AddUser',
		component: CreateUser.screen,
	},
	{
		path: '/admin/settings/user/detail',
		name: 'UpdateUser',
		component: DetailUser.screen,
	},
	{
		path: '/admin/settings/user',
		name: 'ViewUser',
		component: User.screen,
	},
	{
		path: '/admin/settings/organization',
		name: 'Organization',
		component: Organization.screen,
	},

	{
		path: '/admin/settings/general',
		name: 'SaveGeneralSetting',
		component: GeneralSettings.screen,
	},
	// {
	//   path: '/admin/settings/transaction-category/create',
	//   name: 'Create',
	//   component: CreateTransactionCategory.screen
	// },
	// {
	//   path: '/admin/settings/transaction-category/detail',
	//   name: 'Detail',
	//   component: DetailTransactionCategory.screen
	// },
	// {
	//   path: '/admin/settings/transaction-category',
	//   name: 'Transaction Category',
	//   component: TransactionCategory.screen
	// },
	{
		path: '/admin/settings/user-role/create',
		name: 'AddRole',
		component: CreateRole.screen,
	},
	{
		path: '/admin/settings/user-role/update',
		name: 'UpdateRole',
		component: UpdateRole.screen,
	},
	{
		path: '/admin/settings/user-role',
		name: 'ViewRole',
		component: UsersRoles.screen,
	},
	{
		path: '/admin/settings/notification',
		name: 'Notifications',
		component: Notification.screen,
	},
	{
		path: '/admin/settings/data-backup',
		name: 'Data Backup',
		component: DataBackup.screen,
	},
	{
		path: '/admin/settings/help/Faq',
		name: 'Faq',
		component: Faq.screen,
	},
	{
		path: '/admin/settings/help',
		name: 'Help',
		component: Help.screen,
	},
	{
		redirect: true,
		path: '/admin/settings',
		pathTo: '/admin/settings/user',
		name: 'Settings',
	},

	{
		path: '/admin/profile',
		name: 'UpdateProfile',
		component: Profile.screen,
	},

	{
		redirect: true,
		path: '/admin',
		pathTo: '/admin/dashboard',
		name: 'Admin',
	},
];

export default adminRoutes;
