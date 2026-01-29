-- CreateTable
CREATE TABLE "todo" (
    "id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "todo_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "todo_userId_idx" ON "todo"("userId");

-- AddForeignKey
ALTER TABLE "todo" ADD CONSTRAINT "todo_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
