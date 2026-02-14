import "dotenv/config";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { eq } from "drizzle-orm";
import * as schema from "@/lib/db/schema";
import { stores, storeMembers } from "@/lib/db/schema";

async function createDummyStore() {
	const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL;
	if (!connectionString) {
		throw new Error("DATABASE_URL or POSTGRES_URL is not set");
	}

	const requiresSSL = connectionString.includes("sslmode=require") ||
		connectionString.includes("sslmode=prefer") ||
		process.env.VERCEL_ENV !== undefined;

	const queryClient = postgres(connectionString, {
		ssl: requiresSSL ? "require" : undefined,
		max: 1,
	});

	const db = drizzle(queryClient, { schema });

	try {
		console.log("🛍️  Creating store with dummy data...\n");

		// Get or create a test user
		const testEmail = "mansurifarhanfm@gmail.com";
		let testUser = await db
			.select()
			.from(schema.user)
			.where(eq(schema.user.email, testEmail))
			.limit(1)
			.then((users) => users[0] || null);

		if (!testUser) {
			console.log(`  Creating test user: ${testEmail}`);
			const [newUser] = await db
				.insert(schema.user)
				.values({
					id: crypto.randomUUID(),
					name: "Test User",
					email: testEmail,
					emailVerified: true,
				})
				.returning();
			testUser = newUser;
			console.log(`  ✅ Created user: ${testUser.id}\n`);
		} else {
			console.log(`  ✅ Using existing user: ${testUser.id}\n`);
		}

		// Generate a unique slug with timestamp
		const timestamp = Date.now();
		const storeSlug = `dummy-store-${timestamp}`;

		// Dummy store data
		const dummyStoreData = {
			ownerUserId: testUser.id,
			name: "Mansuri Store",
			slug: storeSlug,
			description: "This is a store created for testing purposes. It contains sample data to help you get started.",
			contactEmail: "store@example.com",
			primaryColor: "#3B82F6",
			currency: "USD",
		};

		console.log("  Creating store with the following data:");
		console.log(`    Name: ${dummyStoreData.name}`);
		console.log(`    Slug: ${dummyStoreData.slug}`);
		console.log(`    Description: ${dummyStoreData.description}`);
		console.log(`    Email: ${dummyStoreData.contactEmail}`);
		console.log(`    Primary Color: ${dummyStoreData.primaryColor}\n`);

		// Create store directly using the same logic as createStore helper
		const [createdStore] = await db
			.insert(stores)
			.values({
				id: crypto.randomUUID(),
				ownerUserId: dummyStoreData.ownerUserId,
				name: dummyStoreData.name,
				slug: dummyStoreData.slug,
				description: dummyStoreData.description,
				contactEmail: dummyStoreData.contactEmail,
				primaryColor: dummyStoreData.primaryColor,
				currency: dummyStoreData.currency,
				status: "draft",
				featured: false,
				settings: {
					paymentMethods: [],
					codEnabled: true,
					shippingEnabled: true,
					freeShippingThreshold: undefined,
					termsOfService: "",
					privacyPolicy: "",
					refundPolicy: "",
				},
			})
			.returning();

		// Add owner as store member
		await db.insert(storeMembers).values({
			id: crypto.randomUUID(),
			storeId: createdStore.id,
			userId: dummyStoreData.ownerUserId,
			role: "owner",
			permissions: {
				canManageProducts: true,
				canManageOrders: true,
				canManageCustomers: true,
				canManageSettings: true,
				canViewAnalytics: true,
			},
		});

		console.log("✅ Store created successfully!");
		console.log(`\n📦 Store Details:`);
		console.log(`   ID: ${createdStore.id}`);
		console.log(`   Name: ${createdStore.name}`);
		console.log(`   Slug: ${createdStore.slug}`);
		console.log(`   Status: ${createdStore.status}`);
		console.log(`   Created At: ${createdStore.createdAt}`);
		console.log(`\n🔗 Access your store at: /${createdStore.slug}`);
	} catch (error) {
		console.error("\n❌ Error creating store:", error);
		if (error instanceof Error) {
			console.error("   Message:", error.message);
			if (error.stack) {
				console.error("   Stack:", error.stack);
			}
		}
		process.exit(1);
	} finally {
		await queryClient.end();
	}
}

createDummyStore().catch(console.error);
