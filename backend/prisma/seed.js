const bcrypt = require('bcrypt')
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

const categories = [
    {
        name: 'Окупація',
        description: 'Історії людей, які пережили окупацію населених пунктів.',
    },
    {
        name: 'Евакуація',
        description: 'Спогади про виїзд із небезпечних територій та шлях до безпеки.',
    },
    {
        name: 'Волонтерство',
        description: 'Історії про допомогу військовим, цивільним, переселенцям і громадам.',
    },
    {
        name: 'Втрата дому',
        description: 'Особисті свідчення людей, які втратили житло або були змушені його залишити.',
    },
    {
        name: 'Військова служба',
        description: 'Спогади військових, ветеранів та їхніх родин.',
    },
    {
        name: 'Допомога цивільним',
        description: 'Історії про підтримку мирного населення під час війни.',
    },
    {
        name: 'Життя в тилу',
        description: 'Історії про повсякденне життя, роботу та взаємодопомогу в тилових містах.',
    },
    {
        name: 'Спогади дитинства',
        description: 'Свідчення дітей та молоді про пережиті події війни.',
    },
    {
        name: 'Медична допомога',
        description: 'Історії лікарів, волонтерів, пацієнтів та людей, які отримували допомогу.',
    },
    {
        name: 'Історії родин',
        description: 'Родинні історії, спогади про близьких, розлуку, втрати та підтримку.',
    },
]

const seed = async () => {
    try {
        const adminEmail = 'admin@voiceofwar.com'
        const adminPassword = 'admin123'

        const existingAdmin = await prisma.user.findUnique({
            where: {
                email: adminEmail,
            },
        })

        if (!existingAdmin) {
            const hashedPassword = await bcrypt.hash(adminPassword, 10)

            await prisma.user.create({
                data: {
                    name: 'Адміністратор',
                    email: adminEmail,
                    password: hashedPassword,
                    role: 'ADMIN',
                },
            })

            console.log('Admin user created')
        } else {
            console.log('Admin user already exists')
        }

        for (const category of categories) {
            const existingCategory = await prisma.category.findUnique({
                where: {
                    name: category.name,
                },
            })

            if (!existingCategory) {
                await prisma.category.create({
                    data: category,
                })

                console.log(`Category created: ${category.name}`)
            } else {
                console.log(`Category already exists: ${category.name}`)
            }
        }

        console.log('Seed completed successfully')
    } catch (error) {
        console.error('Seed error:', error)
    } finally {
        await prisma.$disconnect()
    }
}

seed()