'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import signIn from '@/lib/firebase-auth/signIn';
import { useRouter } from 'next/navigation';

const loginFormSchema = z.object({
  username: z.string().nonempty('Usuário é obrigatório'),
  password: z.string().nonempty('Senha é obrigatória'),
  rememberMe: z.boolean(),
});

export default function LoginPage() {
  const router = useRouter();
  const form = useForm<z.infer<typeof loginFormSchema>>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: {
      username: '',
      password: '',
      rememberMe: false,
    },
  });

  function onSubmit(values: z.infer<typeof loginFormSchema>) {

    console.log(values);
    signIn(values.username, values.password, values.rememberMe)
      .then(() => {
        console.log('Usuário autenticado com sucesso');
        return router.push('/');
      })
      .catch((error) => {
        alert('Usuário ou senha inválidos');
        console.error('Erro ao autenticar:', error);
      });
  }

  return (
    <Card className="w-full max-w-md border py-12">
      <CardHeader className="space-y-1">
        <CardTitle className="text-center text-2xl font-bold">Bem-vindo</CardTitle>

        <CardDescription className="text-center">
          Entre com suas credenciais para acessar o sistema
        </CardDescription>
      </CardHeader>

      <CardContent>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="mx-auto flex w-full max-w-sm flex-col items-center space-y-8"
          >
            <div className="w-full space-y-4">
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormLabel>Usuário</FormLabel>

                    <FormControl>
                      <Input placeholder="Informe seu usuário" {...field} />
                    </FormControl>

                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormLabel>Senha</FormLabel>

                    <FormControl>
                      <Input type="password" placeholder="Informe sua senha" {...field} />
                    </FormControl>

                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="rememberMe"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormControl>
                    <Label className="inline-flex items-center space-x-1">
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={(checked) => field.onChange(!!checked)}
                      />

                      <p className="text-sm font-medium">Lembrar de mim</p>
                    </Label>
                  </FormControl>
                </FormItem>
              )}
            />

            <Button className="w-full" type="submit">
              Entrar
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
