'use client';

import * as React from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const PasswordInput = React.forwardRef<HTMLInputElement, React.ComponentProps<'input'>>(
  ({ className, ...props }, ref) => {
    const [showPassword, setShowPassword] = React.useState(false);

    const togglePasswordVisibility = () => setShowPassword((prev) => !prev);

    return (
      <div className="relative">
        <Input
          type={showPassword ? 'text' : 'password'}
          className={cn('pr-10', className)}
          ref={ref}
          {...props}
        />

        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="text-muted-foreground absolute top-1/2 right-2 h-7 w-7 -translate-y-1/2 hover:bg-transparent"
          onClick={togglePasswordVisibility}
          onMouseDown={(e) => e.preventDefault()}
        >
          {showPassword ? (
            <EyeOff className="h-4 w-4" aria-hidden="true" />
          ) : (
            <Eye className="h-4 w-4" aria-hidden="true" />
          )}
        </Button>
      </div>
    );
  }
);

PasswordInput.displayName = 'PasswordInput';

export { PasswordInput };
