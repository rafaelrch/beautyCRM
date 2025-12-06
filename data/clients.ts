import { Client } from '@/types';

// Generate 80 Brazilian clients with realistic data
export const mockClients: Client[] = [
  {
    id: '1',
    name: 'Maria Silva Santos',
    phone: '(71) 98765-4321',
    email: 'maria.silva@email.com',
    birthdate: new Date('1985-03-15'),
    address: 'Rua das Flores, 123, Barra, Salvador - BA',
    cpf: '123.456.789-00',
    registrationDate: new Date('2024-01-10'),
    lastVisit: new Date('2024-11-28'),
    totalSpent: 2450.00,
    totalVisits: 12,
    notes: 'Prefere atendimento pela manhã',
    status: 'active',
  },
  {
    id: '2',
    name: 'Ana Paula Oliveira',
    phone: '(11) 91234-5678',
    email: 'ana.oliveira@email.com',
    birthdate: new Date('1990-07-22'),
    address: 'Av. Paulista, 1000, Bela Vista, São Paulo - SP',
    cpf: '234.567.890-11',
    registrationDate: new Date('2024-02-15'),
    lastVisit: new Date('2024-11-25'),
    totalSpent: 1890.00,
    totalVisits: 8,
    notes: 'Cliente VIP, sempre agendar com antecedência',
    status: 'active',
  },
  {
    id: '3',
    name: 'Carlos Eduardo Ferreira',
    phone: '(21) 99876-5432',
    email: 'carlos.ferreira@email.com',
    birthdate: new Date('1988-11-05'),
    address: 'Rua Copacabana, 456, Copacabana, Rio de Janeiro - RJ',
    cpf: '345.678.901-22',
    registrationDate: new Date('2024-03-20'),
    lastVisit: new Date('2024-10-15'),
    totalSpent: 3200.00,
    totalVisits: 15,
    notes: 'Gosta de produtos premium',
    status: 'active',
  },
  {
    id: '4',
    name: 'Juliana Costa Lima',
    phone: '(85) 98765-1234',
    email: 'juliana.costa@email.com',
    birthdate: new Date('1992-04-18'),
    address: 'Av. Beira Mar, 789, Meireles, Fortaleza - CE',
    cpf: '456.789.012-33',
    registrationDate: new Date('2024-01-05'),
    lastVisit: new Date('2024-11-20'),
    totalSpent: 1560.00,
    totalVisits: 7,
    notes: 'Alérgica a alguns produtos, verificar antes',
    status: 'active',
  },
  {
    id: '5',
    name: 'Roberto Alves Souza',
    phone: '(31) 91234-9876',
    email: 'roberto.alves@email.com',
    birthdate: new Date('1983-09-30'),
    address: 'Rua da Bahia, 321, Centro, Belo Horizonte - MG',
    cpf: '567.890.123-44',
    registrationDate: new Date('2023-12-10'),
    lastVisit: new Date('2024-09-10'),
    totalSpent: 890.00,
    totalVisits: 4,
    notes: 'Cliente inativo há mais de 2 meses',
    status: 'inactive',
  },
  {
    id: '6',
    name: 'Fernanda Rodrigues',
    phone: '(41) 98765-4321',
    email: 'fernanda.rodrigues@email.com',
    birthdate: new Date('1995-01-12'),
    address: 'Av. Sete de Setembro, 555, Centro, Curitiba - PR',
    cpf: '678.901.234-55',
    registrationDate: new Date('2024-04-15'),
    lastVisit: new Date('2024-11-27'),
    totalSpent: 2100.00,
    totalVisits: 10,
    notes: 'Prefere horário noturno',
    status: 'active',
  },
  {
    id: '7',
    name: 'Lucas Martins Pereira',
    phone: '(48) 91234-5678',
    email: 'lucas.martins@email.com',
    birthdate: new Date('1991-06-25'),
    address: 'Rua Felipe Schmidt, 200, Centro, Florianópolis - SC',
    cpf: '789.012.345-66',
    registrationDate: new Date('2024-05-20'),
    lastVisit: new Date('2024-11-26'),
    totalSpent: 1750.00,
    totalVisits: 9,
    notes: 'Novo cliente, muito satisfeito',
    status: 'active',
  },
  {
    id: '8',
    name: 'Patricia Gomes',
    phone: '(81) 99876-5432',
    email: 'patricia.gomes@email.com',
    birthdate: new Date('1987-08-14'),
    address: 'Av. Boa Viagem, 1500, Boa Viagem, Recife - PE',
    cpf: '890.123.456-77',
    registrationDate: new Date('2024-02-28'),
    lastVisit: new Date('2024-11-15'),
    totalSpent: 2980.00,
    totalVisits: 14,
    notes: 'Cliente fiel, sempre pontual',
    status: 'active',
  },
  {
    id: '9',
    name: 'Ricardo Barbosa',
    phone: '(62) 98765-1234',
    email: 'ricardo.barbosa@email.com',
    birthdate: new Date('1986-12-08'),
    address: 'Av. Goiás, 800, Setor Central, Goiânia - GO',
    cpf: '901.234.567-88',
    registrationDate: new Date('2023-11-15'),
    lastVisit: new Date('2024-08-20'),
    totalSpent: 1200.00,
    totalVisits: 6,
    notes: 'Última visita há 3 meses',
    status: 'inactive',
  },
  {
    id: '10',
    name: 'Camila Ribeiro',
    phone: '(51) 91234-9876',
    email: 'camila.ribeiro@email.com',
    birthdate: new Date('1993-03-20'),
    address: 'Av. Borges de Medeiros, 500, Centro, Porto Alegre - RS',
    cpf: '012.345.678-99',
    registrationDate: new Date('2024-06-10'),
    lastVisit: new Date('2024-11-29'),
    totalSpent: 1890.00,
    totalVisits: 8,
    notes: 'Gosta de experimentar novos tratamentos',
    status: 'active',
  },
];

// Generate more clients to reach ~80 total
const firstNames = [
  'Amanda', 'Beatriz', 'Carolina', 'Daniela', 'Eduarda', 'Gabriela', 'Isabela', 'Larissa',
  'Mariana', 'Natália', 'Priscila', 'Rafaela', 'Tatiana', 'Vanessa', 'Yasmin',
  'André', 'Bruno', 'Diego', 'Eduardo', 'Felipe', 'Gabriel', 'Henrique', 'Igor',
  'João', 'Leonardo', 'Marcelo', 'Nicolas', 'Paulo', 'Rafael', 'Thiago', 'Vinicius'
];

const lastNames = [
  'Silva', 'Santos', 'Oliveira', 'Souza', 'Rodrigues', 'Ferreira', 'Alves', 'Pereira',
  'Lima', 'Costa', 'Gomes', 'Ribeiro', 'Martins', 'Carvalho', 'Almeida', 'Lopes',
  'Araújo', 'Fernandes', 'Barbosa', 'Rocha', 'Nascimento', 'Moreira', 'Cavalcanti', 'Dias'
];

const cities = [
  { name: 'Salvador', state: 'BA', area: '71' },
  { name: 'São Paulo', state: 'SP', area: '11' },
  { name: 'Rio de Janeiro', state: 'RJ', area: '21' },
  { name: 'Fortaleza', state: 'CE', area: '85' },
  { name: 'Belo Horizonte', state: 'MG', area: '31' },
  { name: 'Curitiba', state: 'PR', area: '41' },
  { name: 'Florianópolis', state: 'SC', area: '48' },
  { name: 'Recife', state: 'PE', area: '81' },
  { name: 'Goiânia', state: 'GO', area: '62' },
  { name: 'Porto Alegre', state: 'RS', area: '51' },
];

function generateCPF(): string {
  const n1 = Math.floor(Math.random() * 9);
  const n2 = Math.floor(Math.random() * 9);
  const n3 = Math.floor(Math.random() * 9);
  const n4 = Math.floor(Math.random() * 9);
  const n5 = Math.floor(Math.random() * 9);
  const n6 = Math.floor(Math.random() * 9);
  const n7 = Math.floor(Math.random() * 9);
  const n8 = Math.floor(Math.random() * 9);
  const n9 = Math.floor(Math.random() * 9);
  return `${n1}${n2}${n3}.${n4}${n5}${n6}.${n7}${n8}${n9}-${Math.floor(Math.random() * 90) + 10}`;
}

function generatePhone(area: string): string {
  const num1 = Math.floor(Math.random() * 90000) + 10000;
  const num2 = Math.floor(Math.random() * 9000) + 1000;
  return `(${area}) ${num1}-${num2}`;
}

// Generate additional clients
for (let i = 11; i <= 80; i++) {
  const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
  const lastName1 = lastNames[Math.floor(Math.random() * lastNames.length)];
  const lastName2 = lastNames[Math.floor(Math.random() * lastNames.length)];
  const city = cities[Math.floor(Math.random() * cities.length)];
  const birthYear = 1980 + Math.floor(Math.random() * 25);
  const birthMonth = Math.floor(Math.random() * 12);
  const birthDay = Math.floor(Math.random() * 28) + 1;
  const registrationDate = new Date(2024, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1);
  const lastVisitDaysAgo = Math.floor(Math.random() * 120);
  const lastVisit = lastVisitDaysAgo < 60 ? new Date(Date.now() - lastVisitDaysAgo * 24 * 60 * 60 * 1000) : null;
  const totalVisits = Math.floor(Math.random() * 20) + 1;
  const totalSpent = Math.floor(Math.random() * 5000) + 500;
  const status = lastVisitDaysAgo < 60 ? 'active' : 'inactive';

  mockClients.push({
    id: String(i),
    name: `${firstName} ${lastName1} ${lastName2}`,
    phone: generatePhone(city.area),
    email: `${firstName.toLowerCase()}.${lastName1.toLowerCase()}@email.com`,
    birthdate: new Date(birthYear, birthMonth, birthDay),
    address: `Rua ${lastName1}, ${Math.floor(Math.random() * 1000) + 1}, ${city.name} - ${city.state}`,
    cpf: generateCPF(),
    registrationDate,
    lastVisit,
    totalSpent,
    totalVisits,
    notes: Math.random() > 0.7 ? 'Cliente regular' : '',
    status: status as 'active' | 'inactive',
  });
}

