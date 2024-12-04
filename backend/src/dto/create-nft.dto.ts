import { IsString, IsArray, IsOptional, IsEnum, ValidateNested, IsDateString } from 'class-validator';
import { Type } from 'class-transformer';
import { Type as TransformType } from 'class-transformer';

class PedigreeDto {
  @IsString()
  @IsOptional()
  sireId?: string;

  @IsString()
  @IsOptional()
  damId?: string;

  @IsString()
  @IsOptional()
  sireName?: string;

  @IsString()
  @IsOptional()
  damName?: string;
}

class OwnershipHistoryDto {
  @IsString()
  ownerId: string;

  @IsDateString()
  fromDate: string;

  @IsDateString()
  @IsOptional()
  toDate?: string;
}
class MedicalHistoryDto {
  @IsDateString()
  date: string;

  @IsEnum(['vaccine', 'exam', 'treatment'])
  type: 'vaccine' | 'exam' | 'treatment';

  @IsString()
  description: string;

  @IsString()
  veterinarian: string;

  @IsString()
  @IsOptional()
  observations?: string;
}

class CompetitionDto {
  @IsDateString()
  date: string;

  @IsString()
  name: string;

  @IsString()
  result: string;

  @IsString()
  @IsOptional()
  award?: string;
}

class VaccinationDto {
  @IsString()
  disease: string;

  @IsDateString()
  date: string;

  @IsEnum(['IM', 'IN'])
  route: 'IM' | 'IN';
}

export class CreateNFTDto {
  @IsString()
  name: string;

  @IsString()
  breed: string;

  @IsDateString()
  birthDate: string;

  @IsEnum(['stallion', 'mare', 'gelding', 'colt', 'filly'])
  sex: 'stallion' | 'mare' | 'gelding' | 'colt' | 'filly';

  @IsString()
  coatColor: string;

  @IsString()
  @IsOptional()
  weight?: string;

  @IsString()
  @IsOptional()
  height?: string;

  @ValidateNested()
  @Type(() => PedigreeDto)
  pedigree: PedigreeDto;

  @IsArray()
  equineReport: string[];

  @IsString()
  @IsOptional()
  registrationOrganization?: string;

  @IsString()
  @IsOptional()
  microchipNumber?: string;

  @IsString()
  currentOwner: string;

  @IsArray()
  @ValidateNested({ each: true })
  @TransformType(() => OwnershipHistoryDto)
  ownershipHistory: OwnershipHistoryDto[];

  @IsArray()
  images: string[];

  @IsArray()
  @ValidateNested({ each: true })
  @TransformType(() => MedicalHistoryDto)
  medicalHistory: MedicalHistoryDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @TransformType(() => CompetitionDto)
  @IsOptional()
  competitions?: CompetitionDto[];

  @IsString()
  @IsOptional()
  knownAllergies?: string;

  @IsString()
  @IsOptional()
  knownHealthConditions?: string;

  @IsString()
  @IsOptional()
  diet?: string;

  @IsEnum(['pasture_full_time', 'stalled_full_time', 'turned_out_part_time'])
  @IsOptional()
  housingStatus?: 'pasture_full_time' | 'stalled_full_time' | 'turned_out_part_time';

  @IsDateString()
  @IsOptional()
  lastNegativeCogginsTest?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @TransformType(() => VaccinationDto)
  @IsOptional()
  vaccinations?: VaccinationDto[];
}
