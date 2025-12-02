import { useState, useEffect } from 'react';
import {
  Container,
  Title,
  Text,
  Stack,
  Group,
  SimpleGrid,
  Button,
  Box,
  Card,
  ActionIcon,
  Tooltip,
  Transition,
  Affix,
} from '@mantine/core';
import {
  IconLogin,
  IconFileText,
  IconDatabase,
  IconArrowUp,
  IconShield,
  IconEye,
} from '@tabler/icons-react';
import { useConfigStore } from '../stores/configStore';
import { Link } from 'react-router-dom';
import { useWindowScroll } from '@mantine/hooks';

export function HomePage() {
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [scroll] = useWindowScroll();
  const { config } = useConfigStore();

  useEffect(() => {
    setShowScrollTop(scroll.y > 300);
  }, [scroll.y]);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div style={{ minHeight: '100vh' }}>
      {/* Hero Section with Background Image */}
      <Box
        style={{
          position: 'relative',
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          overflow: 'hidden',
        }}
      >
        {/* Background Image */}
        <Box
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundImage: 'url(https://images.unsplash.com/photo-1486312338219-ce68e2c6f44d?w=1200&h=800&fit=crop&crop=center)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            zIndex: 0,
          }}
        />

        {/* Dark Overlay */}
        <Box
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'linear-gradient(135deg, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.5) 100%)',
            zIndex: 1,
          }}
        />

        <Container size="xl" style={{ position: 'relative', zIndex: 2, height: '100%' }}>
          <SimpleGrid cols={{ base: 1, lg: 2 }} spacing="xl">
            <Stack gap="xl">
              <div>
                <Title
                  order={1}
                  size="3rem"
                  c="white"
                  style={{
                    fontWeight: 800,
                    lineHeight: 1.2,
                    marginBottom: '1rem'
                  }}
                >
                  {config.institutionName}
                </Title>
                <Text
                  size="xl"
                  c="white"
                  style={{
                    opacity: 0.9,
                    lineHeight: 1.6,
                    marginBottom: '2rem'
                  }}
                >
                  Sistem manajemen arsip modern dengan keamanan enterprise dan kemudahan akses untuk semua kebutuhan dokumentasi Anda.
                </Text>
              </div>

              <Group gap="md">
                <Button
                  component={Link}
                  to="/login"
                  size="lg"
                  leftSection={<IconLogin size={20} />}
                  style={{
                    backgroundColor: '#3b82f6',
                    fontWeight: 600,
                    padding: '0 2rem',
                  }}
                >
                  Masuk Sistem
                </Button>
                <Button
                  component="a"
                  href="#features"
                  size="lg"
                  variant="outline"
                  style={{
                    borderColor: 'white',
                    color: 'white',
                    fontWeight: 600,
                  }}
                >
                  Jelajahi
                </Button>
              </Group>
            </Stack>

            <Box style={{ display: 'flex', justifyContent: 'center' }}>
              <Card
                padding="xl"
                radius="lg"
                style={{
                  background: 'rgba(255, 255, 255, 0.95)',
                  backdropFilter: 'blur(10px)',
                  maxWidth: 400,
                  width: '100%'
                }}
              >
                <Stack align="center" gap="lg">
                  <IconShield size={48} style={{ color: '#10b981' }} />
                  <div style={{ textAlign: 'center' }}>
                    <Text fw={700} size="lg" mb="sm">Keamanan & Kepercayaan</Text>
                    <Text size="sm" c="dimmed" style={{ lineHeight: 1.6 }}>
                      Platform terpercaya dengan enkripsi tingkat enterprise dan sistem backup otomatis untuk melindungi data penting Anda.
                    </Text>
                  </div>
                </Stack>
              </Card>
            </Box>
          </SimpleGrid>
        </Container>
      </Box>

      {/* Quick Access Section */}
      <Box id="features" style={{
        backgroundColor: '#f8fafc',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        padding: '4rem 0'
      }}>
        <Container size="xl" style={{ width: '100%' }}>
          <Stack gap="3rem" align="center" justify="center" style={{ minHeight: '80vh' }}>
            <div style={{ textAlign: 'center', maxWidth: 700 }}>
              <Title order={2} mb="lg" style={{ fontSize: '2.5rem', fontWeight: 700 }}>
                Akses Data Publik
              </Title>
              <Text size="lg" c="dimmed" style={{ lineHeight: 1.6 }}>
                Jelajahi dokumen arsip dan database publik yang tersedia untuk semua pengguna
              </Text>
            </div>

            <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="2rem" style={{ width: '100%', maxWidth: 900 }}>
              <Card
                padding="0"
                radius="lg"
                withBorder
                style={{
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  border: '2px solid #e5e7eb',
                  overflow: 'hidden',
                  backgroundImage: 'url(https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=400&h=200&fit=crop&crop=center)',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  backgroundRepeat: 'no-repeat',
                  minHeight: 300,
                  display: 'flex',
                  flexDirection: 'column',
                }}
                component={Link}
                to="/public-archive"
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-5px)';
                  e.currentTarget.style.boxShadow = '0 10px 25px rgba(0,0,0,0.1)';
                  e.currentTarget.style.borderColor = '#3b82f6';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                  e.currentTarget.style.borderColor = '#e5e7eb';
                }}
              >
                <Box
                  style={{
                    flex: 1,
                    background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.8) 0%, rgba(59, 130, 246, 0.6) 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '2rem',
                  }}
                >
                  <Stack align="center" gap="lg">
                    <IconFileText size={64} color="white" />
                    <div style={{ textAlign: 'center' }}>
                      <Text fw={700} size="xl" c="white" mb="sm">Dokumen Arsip</Text>
                      <Text c="white" style={{ opacity: 0.9, lineHeight: 1.6 }}>
                        Koleksi dokumen arsip terverifikasi dengan sistem pencarian dan kategorisasi modern
                      </Text>
                    </div>
                  </Stack>
                </Box>
                <Box style={{ padding: '2rem', background: 'white' }}>
                  <Button size="lg" fullWidth leftSection={<IconEye size={20} />}>
                    Jelajahi Dokumen
                  </Button>
                </Box>
              </Card>

              <Card
                padding="0"
                radius="lg"
                withBorder
                style={{
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  border: '2px solid #e5e7eb',
                  overflow: 'hidden',
                  backgroundImage: 'url(https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=200&fit=crop&crop=center)',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  backgroundRepeat: 'no-repeat',
                  minHeight: 300,
                  display: 'flex',
                  flexDirection: 'column',
                }}
                component={Link}
                to="/public-custom-tables"
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-5px)';
                  e.currentTarget.style.boxShadow = '0 10px 25px rgba(0,0,0,0.1)';
                  e.currentTarget.style.borderColor = '#10b981';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                  e.currentTarget.style.borderColor = '#e5e7eb';
                }}
              >
                <Box
                  style={{
                    flex: 1,
                    background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.8) 0%, rgba(16, 185, 129, 0.6) 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '2rem',
                  }}
                >
                  <Stack align="center" gap="lg">
                    <IconDatabase size={64} color="white" />
                    <div style={{ textAlign: 'center' }}>
                      <Text fw={700} size="xl" c="white" mb="sm">Data Publik</Text>
                      <Text c="white" style={{ opacity: 0.9, lineHeight: 1.6 }}>
                        Dataset terstruktur dan informasi publik dengan visualisasi data interaktif
                      </Text>
                    </div>
                  </Stack>
                </Box>
                <Box style={{ padding: '2rem', background: 'white' }}>
                  <Button size="lg" fullWidth leftSection={<IconDatabase size={20} />}>
                    Jelajahi Data
                  </Button>
                </Box>
              </Card>
            </SimpleGrid>

            <Group mt="2rem">
              <Button
                component={Link}
                to="/login"
                size="lg"
                leftSection={<IconLogin size={20} />}
                style={{ fontWeight: 600 }}
              >
                Masuk ke Sistem Lengkap
              </Button>
            </Group>
          </Stack>
        </Container>
      </Box>

      {/* Scroll to Top Button */}
      <Affix position={{ bottom: 30, right: 30 }}>
        <Transition transition="slide-up" mounted={showScrollTop}>
          {(transitionStyles) => (
            <Tooltip label="Kembali ke atas" position="left">
              <ActionIcon
                size={60}
                radius="xl"
                variant="filled"
                style={{
                  ...transitionStyles,
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  boxShadow: '0 8px 24px rgba(102, 126, 234, 0.4)',
                  transition: 'all 0.3s ease',
                }}
                onClick={scrollToTop}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'scale(1.1)';
                  e.currentTarget.style.boxShadow = '0 12px 32px rgba(102, 126, 234, 0.5)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1)';
                  e.currentTarget.style.boxShadow = '0 8px 24px rgba(102, 126, 234, 0.4)';
                }}
              >
                <IconArrowUp size={24} />
              </ActionIcon>
            </Tooltip>
          )}
        </Transition>
      </Affix>

      {/* Footer */}
      <Box style={{
        backgroundColor: '#1f2937',
        color: 'white',
        padding: '3rem 0 2rem',
        marginTop: '4rem'
      }}>
        <Container size="xl">
          <SimpleGrid cols={{ base: 1, md: 3 }} spacing="xl">
            <Stack align="center" gap="sm">
              <Title order={4} style={{ color: '#3b82f6' }}>
                {config.institutionName}
              </Title>
              <Text size="sm" style={{ opacity: 0.8, textAlign: 'center' }}>
                Sistem manajemen arsip digital modern untuk SMAM CILILIN dengan keamanan enterprise dan kemudahan akses.
              </Text>
            </Stack>

            <Stack align="center" gap="sm">
              <Title order={5} style={{ color: '#10b981' }}>
                Teknologi
              </Title>
              <Text size="sm" style={{ opacity: 0.8 }}>
                Dibangun dengan React, TypeScript, dan Supabase
              </Text>
              <Text size="sm" style={{ opacity: 0.6 }}>
                Framework modern untuk performa optimal
              </Text>
            </Stack>

            <Stack align="center" gap="sm">
              <Title order={5} style={{ color: '#f59e0b' }}>
                Developer
              </Title>
              <Text size="sm" style={{ opacity: 0.8 }}>
                Dibuat oleh Muhammad Irfan
              </Text>
              <Text size="sm" style={{ opacity: 0.6 }}>
                Lulusan tahun 2021
              </Text>
            </Stack>
          </SimpleGrid>

          <Box style={{
            borderTop: '1px solid rgba(255,255,255,0.1)',
            marginTop: '2rem',
            paddingTop: '1rem',
            textAlign: 'center'
          }}>
            <Text size="sm" style={{ opacity: 0.6 }}>
              © 2025 {config.institutionName}. All rights reserved.
            </Text>
          </Box>
        </Container>
      </Box>
    </div>
  );
}