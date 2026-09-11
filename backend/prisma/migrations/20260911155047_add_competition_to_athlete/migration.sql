-- AlterTable
ALTER TABLE "athletes" ADD COLUMN     "competitionId" TEXT;

-- AddForeignKey
ALTER TABLE "athletes" ADD CONSTRAINT "athletes_competitionId_fkey" FOREIGN KEY ("competitionId") REFERENCES "competitions"("id") ON DELETE SET NULL ON UPDATE CASCADE;
