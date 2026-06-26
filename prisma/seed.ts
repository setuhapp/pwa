import { db } from "../src/lib/db";

async function main() {
  // Wipe in FK-safe order (child tables before parent tables).
  // review does NOT exist yet in the schema — skip it.
  await db.bookmark.deleteMany();
  await db.engagement.deleteMany();
  await db.verification.deleteMany();
  await db.session.deleteMany();
  await db.caregiver.deleteMany();
  await db.member.deleteMany();
  await db.admin.deleteMany();

  // Insert 8 caregivers with deterministic data.
  const caregivers = await Promise.all([
    db.caregiver.create({
      data: {
        phone: "9100000001",
        name: "Meena Devi",
        address: "14, Anna Nagar East",
        city: "Chennai",
        photoUrl: "/icon.png",
        skills: JSON.stringify(["dementia", "post-stroke", "cooking"]),
        qualifications: "GNM",
        experienceYears: 8,
        priorFamilies: "5 families over 8 years",
        specialisations: JSON.stringify(["dementia", "post-stroke"]),
        availability: "live-in",
        dailyRate: 1000,
        monthlyRate: 22000,
        isHidden: false,
      },
    }),
    db.caregiver.create({
      data: {
        phone: "9100000002",
        name: "Rajan Kumar",
        address: "22, RS Puram",
        city: "Coimbatore",
        photoUrl: "/icon.png",
        skills: JSON.stringify(["bedridden", "injection", "mobility-assist"]),
        qualifications: "ANM",
        experienceYears: 5,
        priorFamilies: "3 families",
        specialisations: JSON.stringify(["bedridden", "post-op"]),
        availability: "part-time",
        dailyRate: 700,
        monthlyRate: 15000,
        isHidden: false,
      },
    }),
    db.caregiver.create({
      data: {
        phone: "9100000003",
        name: "Lakshmi S",
        address: "7, Alagapuram",
        city: "Madurai",
        photoUrl: "/icon.png",
        skills: JSON.stringify(["dementia", "physiotherapy-aware", "cooking"]),
        qualifications: "B.Sc Nursing",
        experienceYears: 12,
        priorFamilies: "7 families",
        specialisations: JSON.stringify(["dementia", "palliative"]),
        availability: "live-in",
        dailyRate: 1200,
        monthlyRate: 26000,
        isHidden: false,
      },
    }),
    db.caregiver.create({
      data: {
        phone: "9100000004",
        name: "Priya Nair",
        address: "88, Koramangala 4th Block",
        city: "Bengaluru",
        photoUrl: "/icon.png",
        skills: JSON.stringify(["post-stroke", "injection", "mobility-assist"]),
        qualifications: "GNM",
        experienceYears: 6,
        priorFamilies: "4 families",
        specialisations: JSON.stringify(["post-stroke", "general"]),
        availability: "part-time",
        dailyRate: 900,
        monthlyRate: 19000,
        isHidden: false,
      },
    }),
    db.caregiver.create({
      data: {
        phone: "9100000005",
        name: "Suresh Babu",
        address: "3, Jubilee Hills Road 45",
        city: "Hyderabad",
        photoUrl: "/icon.png",
        skills: JSON.stringify(["bedridden", "cooking", "mobility-assist"]),
        qualifications: "Diploma in Nursing",
        experienceYears: 3,
        priorFamilies: "2 families",
        specialisations: JSON.stringify(["general", "post-op"]),
        availability: "live-in",
        dailyRate: 750,
        monthlyRate: 16000,
        isHidden: false,
      },
    }),
    // Two hidden caregivers
    db.caregiver.create({
      data: {
        phone: "9100000006",
        name: "Kavitha R",
        address: "56, T Nagar",
        city: "Chennai",
        photoUrl: "/icon.png",
        skills: JSON.stringify(["dementia", "injection"]),
        qualifications: "ANM",
        experienceYears: 9,
        priorFamilies: "6 families",
        specialisations: JSON.stringify(["dementia"]),
        availability: "live-in",
        dailyRate: 950,
        monthlyRate: 21000,
        isHidden: true,
      },
    }),
    db.caregiver.create({
      data: {
        phone: "9100000007",
        name: "Anand M",
        address: "12, Gandhipuram",
        city: "Coimbatore",
        photoUrl: "/icon.png",
        skills: JSON.stringify(["physiotherapy-aware", "mobility-assist"]),
        qualifications: "Physiotherapy aide certificate",
        experienceYears: 4,
        priorFamilies: "3 families",
        specialisations: JSON.stringify(["post-stroke", "bedridden"]),
        availability: "part-time",
        dailyRate: 650,
        monthlyRate: 14000,
        isHidden: true,
      },
    }),
    // One caregiver with only step-1 fields (completeness < 100 — demo the completeness indicator)
    db.caregiver.create({
      data: {
        phone: "9100000008",
        name: "Divya T",
        address: "9, Velachery Main Road",
        city: "Chennai",
        photoUrl: "/icon.png",
        skills: null,
        qualifications: null,
        experienceYears: null,
        priorFamilies: null,
        specialisations: null,
        availability: null,
        dailyRate: null,
        monthlyRate: null,
        isHidden: false,
      },
    }),
  ]);

  // Insert one admin
  const admin = await db.admin.create({
    data: {
      phone: "9000000000",
      name: "SETUH Admin",
    },
  });

  console.log(`Inserted ${caregivers.length} caregivers (2 hidden, 1 partial at 25%).`);
  console.log(`Inserted 1 admin: ${admin.name} (${admin.phone}).`);
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Seed error:", err);
    process.exit(1);
  });
