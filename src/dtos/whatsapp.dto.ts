import { ApiProperty } from "@nestjs/swagger";
import { IsString } from "class-validator";

export class SendMessageDto {
    @ApiProperty({ description: 'The phone number to send the message to', example: '+905311111111' })
    @IsString()
    number: string;
    @ApiProperty({ description: 'The message to send', example: 'Hello, World!' })
    @IsString()
    message: string;
} 