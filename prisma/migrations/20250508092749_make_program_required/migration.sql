-- First, create a default program if it doesn't exist already
DO $$
DECLARE
  default_program_id TEXT;
BEGIN
  -- Check if we already have a program named 'Default Membership'
  SELECT id INTO default_program_id FROM "Program" WHERE name = 'Default Membership' LIMIT 1;
  
  -- If not, create one
  IF default_program_id IS NULL THEN
    INSERT INTO "Program" (id, name, description, duration, price, active, "createdAt", "updatedAt")
    VALUES (
      gen_random_uuid(), 
      'Default Membership', 
      'Default membership program for legacy payments', 
      30, 
      49.99, 
      true, 
      NOW(), 
      NOW()
    )
    RETURNING id INTO default_program_id;
  END IF;
  
  -- Update existing payments with NULL programId to use the default program
  UPDATE "Payment"
  SET "programId" = default_program_id
  WHERE "programId" IS NULL;
  
END $$;

-- Now make the programId column non-nullable
-- DropForeignKey
ALTER TABLE "Payment" DROP CONSTRAINT "Payment_programId_fkey";

-- AlterTable
ALTER TABLE "Payment" ALTER COLUMN "programId" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_programId_fkey" FOREIGN KEY ("programId") REFERENCES "Program"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
