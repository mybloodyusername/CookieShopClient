import { GeneratorConfig } from 'ng-openapi';

const config: GeneratorConfig = {
  input: 'http://localhost:5265/openapi/v1.json',
  output: './src/api',
  options: {
    dateType: 'Date',
    enumStyle: 'enum',
    naming: {
      services: {
        prefix: 'Api',
      },
    },
    serviceDecorator: 'service',
    useSingleRequestParameter: true,
  },
};

export default config;
