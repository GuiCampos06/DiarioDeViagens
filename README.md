# Diário de Viagens

Aplicativo para registrar lugares que você deseja conhecer ou já visitou, com fotos, localização no mapa e estatísticas das viagens.

## Integrantes

- Guilherme Campos
- Cauã Henrique
- Rodrigo Avelar

## Como rodar

Instale Node.js 24 LTS e use o Expo Go compatível com SDK 58.

```bash
git clone https://github.com/GuiCampos06/DiarioDeViagens.git
cd DiarioDeViagens
npm ci
npm start
```

Conecte o celular à mesma rede do computador e abra o QR code no Expo Go. Para usar um emulador Android já configurado, execute `npm run android`.

## Arquitetura

O estado dos lugares é compartilhado entre as telas com Context API e salvo no dispositivo com AsyncStorage.

```text
App.tsx          Inicialização e navegação
src/screens/     Lista, cadastro, detalhes, mapa e estatísticas
src/components/  Componentes visuais e estilos
src/context/     Acesso ao estado compartilhado
src/core/        Modelos, validações e cálculos
src/store/       Estado e armazenamento dos lugares
src/hooks/       Localização do usuário
src/services/    Câmera e galeria
assets/          Imagens e ícones
```

## Linguagens e tecnologias

- TypeScript e JavaScript.
- React Native, React e Expo SDK 58.
- React Navigation para navegação.
- Context API e AsyncStorage para estado e persistência.
- Expo Location e React Native Maps para localização e mapas.
- Expo Image Picker, Media Library e File System para fotos.
- React Native SVG e SVG Charts para gráficos.
