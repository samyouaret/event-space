import type { PrismaClient } from "@prisma/client";

interface PostFilter {

    title?: string;

    description?: string;

    annotated?: boolean;

    page: number | string;
}

export default class DiseasePostRepository {

    prisma: PrismaClient;

    constructor(prisma: PrismaClient) {
        this.prisma = prisma;
    }

    async all(params?: PostFilter, userId?: number) {
        let per_page = 2;
        let options: any = {
            include: {
                picture: true,
                diagnostic: true
            },
            take: per_page
        };
        if (params && params.page > 1) {
            options.skip = (+params.page - 1) * per_page;
        }
        if (params) {
            options.where = {};
            userId && (options.where.userId = userId);
            params.title && (options.where.title = params.title);
            params.description && (options.where.description = params.description);
            params.annotated && (options.where.annotated = params.annotated);
        }
        let data = await this.prisma.diseasePost.findMany(options);
        let total = await this.prisma.diseasePost.count();
        return { data, total, per_page };
    }

    async one(id: number) {
        return this.prisma.diseasePost.findFirst({
            where: { id },
            include: {
                picture: true,
                diagnostic: true
            },
        });
    }

    async save(post: { title: string, description: string, userId: number }, pictures: any[]) {
        return this.prisma.diseasePost.create({
            data: {
                ...post,
                picture: {
                    create: pictures
                }
            },

        })
    }

    /**
     * 
     * @todo make it remove itself
     */
    async remove(id: number) {
        return this.prisma.diseasePost.update({
            where: { id },
            data: {
                picture: {
                    deleteMany: {}
                },
                diagnostic: {
                    deleteMany: {}
                }
            }
        });
    }

}