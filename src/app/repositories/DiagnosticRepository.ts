import type { PrismaClient } from "@prisma/client";

interface DiagnosticFilter {

    diseaseName?: string;

    description?: string;

    treatment?: string;

    userId?: number;
}

export default class DiagnosticRepository {

    prisma: PrismaClient;

    constructor(prisma: PrismaClient) {
        this.prisma = prisma;
    }

    async all(params?: DiagnosticFilter) {
        return this.prisma.diagnostic.findMany({
            where: params,
            orderBy: { createdAt: 'desc' }
        });
    }

    async one(id: number) {
        return this.prisma.diagnostic.findFirst({
            where: { id },
            include: {
                DiseasePost: true
            }
        });
    }

    async save(diagnostic: { diseaseName: string, diseasePostId: number, description: string, treatment: string, userId: number }) {
        return this.prisma.diagnostic.create({ data: diagnostic });
    }

    async remove(id: number) {
        return this.prisma.diagnostic.delete({
            where: { id }
        });
    }

}