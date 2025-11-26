import { Container, Center } from '@mantine/core';
import { LoginForm } from '../components/Auth/LoginForm';

export function LoginPage() {
  return (
    <Container size="xs" h="100vh">
      <Center h="100%">
        <LoginForm />
      </Center>
    </Container>
  );
}
