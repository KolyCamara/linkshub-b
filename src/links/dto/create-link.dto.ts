import { IsIn, IsOptional, IsString, IsUrl, MinLength } from 'class-validator';

const linkTypes = [
  'Documentation',
  'Outil',
  'Ressource',
  'Repository',
  'Formation',
] as const;

export class CreateLinkDto {
  @IsString()
  @MinLength(1)
  name!: string;

  @IsUrl({ protocols: ['http', 'https'], require_protocol: true })
  url!: string;

  @IsString()
  @MinLength(1)
  categoryId!: string;

  @IsOptional()
  @IsIn(linkTypes)
  resourceType?: (typeof linkTypes)[number];

  @IsOptional()
  @IsString()
  description?: string;
}
