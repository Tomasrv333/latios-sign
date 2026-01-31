import { IsString, IsNotEmpty, IsEnum, IsOptional, IsUUID } from 'class-validator';

export enum VariableType {
    TEXT = 'TEXT',
    NUMBER = 'NUMBER',
    DATE = 'DATE',
    CURRENCY = 'CURRENCY',
    EMAIL = 'EMAIL',
    PHONE = 'PHONE'
}

export class CreateVariableDto {
    @IsString()
    @IsNotEmpty()
    key: string;

    @IsString()
    @IsNotEmpty()
    label: string;

    @IsEnum(VariableType)
    type: VariableType;

    @IsOptional()
    @IsString()
    description?: string;

    @IsOptional()
    @IsUUID()
    containerId?: string;
}
