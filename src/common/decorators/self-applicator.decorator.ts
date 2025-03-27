import { createParamDecorator, ExecutionContext, ForbiddenException } from '@nestjs/common';

export const SelfApplicator = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const applicator = request.applicator || request.user;
    const requestedId = request.params.applicatorId;
    
    if (!applicator) {
      throw new ForbiddenException('Applicator not authenticated');
    }
    
    if (requestedId && applicator.id !== requestedId) {
      throw new ForbiddenException('You can only access your own resources');
    }
    
    return applicator;
  },
);