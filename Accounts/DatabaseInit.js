const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const Logger = require("./Logger");

const UniversityData = [
    {
        Faculty: {
            name: "Faculty of Engineering and the Built Environment",
            abbreviation: "FEBE",
        },
        Schools: [
            {
                School: {
                    name: "School of Architecture and Spatial Planning",
                    abbreviation: "SASP",
                },
                programmes: [
                    {
                        name: "Bachelor of Architecture",
                        abbreviation: "BA-Architecture",
                    },
                    {
                        name: "Diploma in Technology Architecture",
                        abbreviation: "DTech-Architecture",
                    },
                ],
            },
            {
                School: {
                    name: "School of Aerospace and Vehicle Engineering ",
                    abbreviation: "SAVE",
                },
                programmes: [
                    {
                        name: "Bachelor of Engineering Aeronotical Engineering",
                        abbreviation: "BEng-Aeronotical",
                    },
                    {
                        name: "Diploma in Technology Aeronotical Engineering",
                        abbreviation: "DTech-Aeronotical",
                    },
                ],
            },
        ],
        // ExecutiveDean: {
        //     role: {
        //         name: "Dean",
        //         label: "Executive Dean",
        //         description: "A Faculty Executive Dean",
        //         permissions: [],
        //     },
        //     account: {
        //         email: "dean.fast@tukenya.ac.ke",
        //         password: "secret",
        //     },

        //     user: {
        //         title: "Prof",
        //         firstName: "Edwin",
        //         lastName: "Ataro",
        //     },
        //     staffProfile: {
        //         position:
        //             "Executive Dean Faculty of Engineering and Built Environment",
        //         staffRegistrationNumber: "EEAQ/0001/2019",
        //     },
        // },
    },
    {
        Faculty: {
            name: "Faculty of Applied Sciences and Technology",
            abbreviation: "FAST",
        },
        // ExecutiveDean: {
        //     role: {
        //         name: "Dean",
        //         label: "Executive Dean",
        //         description: "A Faculty Executive Dean",
        //         permissions: [],
        //     },
        //     account: {
        //         email: "dean.fast@tukenya.ac.ke",
        //         password: "secret",
        //     },

        //     user: {
        //         title: "Prof",
        //         firstName: "Edwin",
        //         lastName: "Ataro",
        //     },
        //     staffProfile: {
        //         position:
        //             "Executive Dean Faculty of Engineering and Built Environment",
        //         staffRegistrationNumber: "EEAQ/0001/2019",
        //     },
        // },
        Schools: [
            {
                School: {
                    name: "School of Computing and Information Technology ",
                    abbreviation: "SCIT",
                },
                programmes: [
                    {
                        name: "Bachelor of Technology Information Technology",
                        abbreviation: "BTech-IT",
                    },
                    {
                        name: "Bachelor of Technology Computer Technology ",
                        abbreviation: "BTech-CT",
                    },
                    {
                        name: "Bachelor of Technology Communication and Computer Networks ",
                        abbreviation: "BTech-CN",
                    },
                    {
                        name: "Diploma In Technology In Information Technology",
                        abbreviation: "DTech-IT",
                    },
                    {
                        name: "Diploma In Technology In Computer Technology ",
                        abbreviation: "DTech-CT",
                    },
                    {
                        name: "Diploma In Technology In Communication and Computer Networks ",
                        abbreviation: "DTech-CN",
                    },
                ],
            },
            {
                School: {
                    name: "School of Biological and Life Sciences ",
                    abbreviation: "SBLS",
                },
                programmes: [
                    {
                        name: "Bachelor of Technology Applied Biology",
                        abbreviation: "BTech-A. Biology",
                    },
                    {
                        name: "Bachelor of Technology Biotechnology",
                        abbreviation: "BTech-Biotechnology",
                    },
                ],
            },
        ],
    },
    {
        Faculty: {
            name: "Faculty Social Sciences and Technology",
            abbreviation: "FSST",
        },
        Schools: [
            {
                School: {
                    name: "School of Business and Management Studies",
                    abbreviation: "SBMS",
                },
                programmes: [
                    {
                        name: "Bachelor of Science Accountancy",
                        abbreviation: "BAS-Accountancy",
                    },
                    {
                        name: "Bachelor of Commerce",
                        abbreviation: "BCom",
                    },
                ],
            },
            {
                School: {
                    name: "School of Creative Arts and Media ",
                    abbreviation: "SCAM",
                },
                programmes: [
                    {
                        name: "Bachelor of Technology Design",
                        abbreviation: "BTech Design",
                    },
                    {
                        name: "Bachelor of Technology Journalism and Mass Communication",
                        abbreviation: "BTech-Journalism",
                    },
                ],
            },
        ],
    },
];

async function initDatabase() {
    await prisma.programme.deleteMany();
    await prisma.school.deleteMany();
    await prisma.faculty.deleteMany();

    Logger.info("Determining if there are faculties in DB...");
    const facultiesCount = await prisma.faculty.count();
    Logger.info(`Found ${facultiesCount} Faculties`);

    if (facultiesCount > 0) {
        return;
    }

    Logger.info("Creating Faculties and Associated Objects...");

    UniversityData.map(async (faculty) => {
        const createdFaculty = await prisma.faculty.create({
            data: faculty.Faculty,
        });

        faculty.Schools.map(async (school) => {
            const createdSchool = await prisma.school.create({
                data: {
                    ...school.School,
                    facultyId: createdFaculty.id,
                },
            });

            school.programmes.map(async (programme) => {
                await prisma.programme.create({
                    data: {
                        ...programme,
                        schoolId: createdSchool.id,
                    },
                });
            });
        });
    });

    // const faculties = await prisma.faculty.createMany({

    //     data: [
    //         {
    //             name: "Faculty of Engineering and the Built Environment",
    //             abbreviation: "FEBE",
    //             schools: {
    //                 create: [
    //                     {
    //                         name: "School of Architecture and Spatial Planning",
    //                         abbreviation: "SASP",

    //                         programmes: {
    //                             create: [
    //                                 {
    //                                     name: "Bachelor of Architecture",
    //                                     abbreviation: "BA-Architecture",
    //                                 },
    //                                 {
    //                                     name: "Diploma in Technology Architecture",
    //                                     abbreviation: "DTech-Architecture",
    //                                 },
    //                             ],
    //                         },
    //                     },
    //                     {
    //                         name: "School of Aerospace and Vehicle Engineering ",
    //                         abbreviation: "SAVE",

    //                         programmes: {
    //                             create: [
    //                                 {
    //                                     name: "Bachelor of Engineering Aeronotical Engineering",
    //                                     abbreviation: "BEng-Aeronotical",
    //                                 },
    //                                 {
    //                                     name: "Diploma in Technology Aeronotical Engineering",
    //                                     abbreviation: "DTech-Aeronotical",
    //                                 },
    //                             ],
    //                         },
    //                     },
    //                 ],
    //             },
    //         },
    //         {
    //             name: "Faculty of Applied Sciences and Technology",
    //             abbreviation: "FAST",

    //             schools: {
    //                 create: [
    //                     {
    //                         name: "School of Computing and Information Technology ",
    //                         abbreviation: "SCIT",

    //                         programmes: {
    //                             create: [
    //                                 {
    //                                     name: "Bachelor of Technology Information Technology",
    //                                     abbreviation: "BTech-IT",
    //                                 },
    //                                 {
    //                                     name: "Bachelor of Technology Computer Technology ",
    //                                     abbreviation: "BTech-CT",
    //                                 },
    //                                 {
    //                                     name: "Diploma In Technology In Communication and Computer Networks ",
    //                                     abbreviation: "DTech-CN",
    //                                 },
    //                                 {
    //                                     name: "Diploma In Technology In Information Technology",
    //                                     abbreviation: "DTech-IT",
    //                                 },
    //                                 {
    //                                     name: "Diploma In Technology In Computer Technology ",
    //                                     abbreviation: "DTech-CT",
    //                                 },
    //                                 {
    //                                     name: "Diploma In Technology In Communication and Computer Networks ",
    //                                     abbreviation: "DTech-CN",
    //                                 },
    //                             ],
    //                         },
    //                     },
    //                     {
    //                         name: "School of Biological and Life Sciences ",
    //                         abbreviation: "SBLS",

    //                         programmes: {
    //                             create: [
    //                                 {
    //                                     name: "Bachelor of Technology Applied Biology",
    //                                     abbreviation: "BTech-A. Biology",
    //                                 },
    //                                 {
    //                                     name: "Bachelor of Technology Biotechnology",
    //                                     abbreviation: "BTech-Biotechnology",
    //                                 },
    //                             ],
    //                         },
    //                     },
    //                 ],
    //             },
    //         },
    //         {
    //             name: "Faculty Social Sciences and Technology",
    //             abbreviation: "FSST",

    //             schools: {
    //                 create: [
    //                     {
    //                         name: "School of Business and Management Studies",
    //                         abbreviation: "SBMS",

    //                         programmes: {
    //                             create: [
    //                                 {
    //                                     name: "Bachelor of Science Accountancy",
    //                                     abbreviation: "BAS-Accountancy",
    //                                 },
    //                                 {
    //                                     name: "Bachelor of Commerce",
    //                                     abbreviation: "BCom",
    //                                 },
    //                             ],
    //                         },
    //                     },
    //                     {
    //                         name: "School of Creative Arts and Media ",
    //                         abbreviation: "SCAM",

    //                         programmes: {
    //                             create: [
    //                                 {
    //                                     name: "Bachelor of Technology Design",
    //                                     abbreviation: "BTech Design",
    //                                 },
    //                                 {
    //                                     name: "Bachelor of Technology Journalism and Mass Communication",
    //                                     abbreviation: "BTech-Journalism",
    //                                 },
    //                             ],
    //                         },
    //                     },
    //                 ],
    //             },
    //         },
    //     ],
    // });

    // console.log("results: ", faculties);
}

module.exports = { PrismaClient, prisma, initDatabase };
