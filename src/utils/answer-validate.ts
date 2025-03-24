import { registerDecorator, ValidationOptions, ValidationArguments } from 'class-validator';
import { AnswerType } from 'src/common/enums/answer.enum';

export function IsValidAnswerValue(validationOptions?: ValidationOptions) {
  return function (object: unknown, propertyName: string) {
    registerDecorator({
      name: 'isValidAnswerValue',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          if (typeof value !== 'object' || value === null) {
            return false;
          }

          // Gerekli alanların kontrol edilmesi
          if (!value.type || typeof value.type !== 'string') {
            return false;
          }

          // Tip bazlı validasyon
          switch (value.type) {
            case AnswerType.TEXT:
              return typeof value.value === 'string';
            case AnswerType.NUMBER:
              return typeof value.value === 'number';
            case AnswerType.BOOLEAN:
              return typeof value.value === 'boolean';
            case AnswerType.DATE:
              return value.value instanceof Date || !isNaN(Date.parse(value.value));
            case AnswerType.MULTIPLE_CHOICE:
              return Array.isArray(value.values);
            default:
              return true; // Diğer tiplere izin ver
          }
        },
        defaultMessage(args: ValidationArguments) {
          return `${args.property} geçerli bir cevap değeri formatında olmalıdır`;
        },
      },
    });
  };
}
