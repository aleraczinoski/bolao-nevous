import { IsInt, IsString, Min } from 'class-validator';

export class CreatePredictionDto {
  @IsString()
  matchId!: string;

  @IsInt()
  @Min(0)
  homeScore!: number;

  @IsInt()
  @Min(0)
  awayScore!: number;
}
