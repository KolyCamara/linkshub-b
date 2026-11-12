import { IsString, MinLength } from 'class-validator';

export class AddLinkDto {
  @IsString()
  @MinLength(1)
  linkId!: string;
}
