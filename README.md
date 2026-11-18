# passo. — Diário de Viagens Mobile

Versão **somente mobile**, independente, do [projeto original](https://github.com/GuiCampos06/diario-de-viagens). Aplicativo para Android e iOS em **Expo SDK 58**, com React 19.3, React Native 0.88.1 e React Navigation.

Este repositório não precisa do monorepo nem da aplicação web para instalar ou executar. As regras de negócio e o armazenamento foram incluídos em `src/core` e `src/store`; as funcionalidades do aplicativo foram preservadas.

## Integrantes

- Guilherme Campos
- Cauã Henrique
- Rodrigo Avelar

Projeto do 2º bimestre de Programação para Dispositivos Móveis I — Fatec Franca.

## Instalar e executar

Instale **Node.js 24 LTS, versão 24.13 ou superior**, e npm. Depois:

```bash
git clone https://github.com/GuiCampos06/diario-de-viagens-mobile.git
cd diario-de-viagens-mobile
npm ci
npm start
```

Abra o QR code com **Expo Go compatível com SDK 58**, no celular conectado à mesma rede do computador. No Android, use o Expo Go; no iPhone, a câmera. Caso seu Expo Go não suporte esse SDK, instale uma versão compatível disponibilizada pelo Expo ou use um development build. Builds de SDKs anteriores precisam ser reconstruídos.

Se a rede bloquear a conexão local, use `npm start -- --tunnel` e siga as instruções do Expo para instalar o suporte necessário. Com um emulador Android já aberto, use `npm run android`. Para abrir em um simulador iOS, use `npm run ios` em um Mac preparado para desenvolvimento iOS.

## Funcionalidades

- **Meu diário:** lista com foto, nome, cidade e status; busca sem distinção de acentos e filtros.
- **Cadastro:** nome, descrição, rua, número, cidade, estado, status e foto. O endereço precisa ser encontrado por `Location.geocodeAsync` antes de salvar.
- **Detalhes:** foto, descrição, endereço e mini mapa; edição, marcar como visitado e remoção com confirmação.
- **Mapa:** marcadores dos lugares e posição atual pelo hook `useLocation`, quando autorizada.
- **Estatísticas:** pizza por status com legendas numéricas e barras por cidade/estado, calculadas a partir dos registros reais.
- **Fotos:** captura pela câmera ou seleção da galeria; fotos capturadas também são salvas na galeria. Uma cópia fica no armazenamento permanente do aplicativo.
- **Persistência:** os registros são mantidos entre sessões com AsyncStorage. Falhas de gravação preservam o último estado salvo.

## Organização dos arquivos

```text
App.tsx                 Abas, navegação, contexto e abertura do aplicativo
index.ts                Entrada registrada no Expo
app.json                Identidade, ícones e mensagens de permissão
src/
  screens/              Lista, cadastro, detalhes, mapa e estatísticas
  components/ui.tsx     Cores, estilos, botões e etiqueta de status
  context/              Acesso das telas ao mesmo contexto do diário
  hooks/useLocation.ts  Permissão, posição atual e encerramento do GPS
  services/photos.ts    Câmera, galeria e cópia permanente das imagens
  core/                 Modelo, validações, busca, estatísticas e testes
  store/                Contexto, fila de gravação e testes de persistência
```

O `package.json` reúne as dependências e comandos. O `package-lock.json` fixa as versões para instalações reproduzíveis. O `tsconfig.json` configura a verificação de tipos e `eslint.config.js` configura a revisão estática. O `.gitignore` mantém dependências, dados locais e arquivos de agentes/skills fora do repositório. Os ícones ficam em `assets/`.

## Verificações

```bash
npm run check
npm run export:android
npx expo-doctor
```

`check` executa TypeScript, ESLint e os cinco testes de regras e persistência. A exportação Android verifica o empacotamento JavaScript/Hermes: **não gera APK e não substitui o teste em aparelho físico**. O GitHub Actions executa a instalação, os checks e a exportação Android a cada push e pull request.

### Roteiro no aparelho

1. Cadastre um lugar com foto da galeria e endereço válido. Confira lista, detalhes e marcador no mapa.
2. Tire uma foto pelo aplicativo e confirme que ela aparece no diário e na galeria do celular.
3. Tente um endereço inexistente: o app deve avisar e não criar um lugar sem coordenadas.
4. Negue câmera, galeria e localização separadamente e confira os avisos. Reautorize e tente novamente.
5. Edite um lugar, marque como visitado e remova com confirmação. Confira as mudanças na lista, mapa e gráficos.
6. Use dois status e pelo menos duas cidades e confira os valores da pizza e das barras.
7. Feche e reabra o aplicativo para conferir os dados e fotos. Saia de um formulário alterado para conferir o aviso.

## Limites importantes

- O diário é local: não há conta, servidor ou sincronização entre instalações. Limpar os dados ou desinstalar o aplicativo pode apagar o diário. A extração do código não copia registros ou fotos pessoais de outra instalação.
- Mapas e geocodificação precisam de internet. As permissões de câmera, galeria e localização são pedidas no contexto de uso, com avisos quando negadas. Não há GPS em segundo plano.
- Remover um lugar preserva a foto original na galeria. Cópias internas sem vínculo permanecem no armazenamento do app.
- `react-native-svg-charts` é uma biblioteca antiga exigida pela proposta. `.npmrc` habilita `legacy-peer-deps`; os overrides de `d3-color` e `minimatch` preservam as correções usadas no projeto original.
- Para criar um Android independente, configure a chave Google Maps do seu projeto antes do build. Não publique credenciais no GitHub.
- O código foi extraído do commit `88bc93a` do projeto original. Os dois repositórios passam a ser independentes: futuras alterações não são sincronizadas automaticamente.

O arquivo `LICENSE` mantém a licença do template original do Expo. A versão web continua disponível apenas no repositório original.
