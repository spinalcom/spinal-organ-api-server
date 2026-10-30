import { expect } from 'chai';
import express from 'express';
import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';
import { runInNewContext } from 'vm';
import { ModuleKind, transpileModule } from 'typescript';

const routesDirectory = join(__dirname, '../../src/routes');

function findRouteModules(directory: string, prefix = './v2'): string[] {
  return readdirSync(directory, { withFileTypes: true })
    .filter((entry) => entry.name !== 'openApiCompo')
    .flatMap((entry) => {
      const modulePath = `${prefix}/${entry.name}`;
      if (entry.isDirectory()) {
        return findRouteModules(join(directory, entry.name), modulePath);
      }
      return entry.name.endsWith('.ts') && !entry.name.endsWith('.d.ts')
        ? [modulePath.slice(0, -3)]
        : [];
    })
    .sort();
}

describe('v2 production route registration', () => {
  const routeModules = findRouteModules(join(routesDirectory, 'v2'));
  const registrations = new Map<string, unknown[][]>();
  const logger = {};
  const app = express();
  const middleware = {};

  before(() => {
    const source = readFileSync(join(routesDirectory, 'routes.ts'), 'utf8');
    const { outputText } = transpileModule(source, {
      compilerOptions: { module: ModuleKind.CommonJS },
    });
    const moduleExports = {
      default: (..._args: unknown[]) => {
        throw new Error('Production route registrar was not exported');
      },
    };

    // Execute the production wiring without loading handlers or connecting to a hub.
    runInNewContext(outputText, {
      exports: moduleExports,
      require(modulePath: string) {
        const register = (...args: unknown[]) => {
          if (!modulePath.startsWith('./v2/')) return;
          const calls = registrations.get(modulePath) || [];
          calls.push(args);
          registrations.set(modulePath, calls);
        };
        return Object.assign(register, { default: register });
      },
    });
    moduleExports.default(logger, app, middleware);
  });

  it('has v2 route modules to check', () => {
    expect(routeModules).not.to.be.empty;
  });

  for (const modulePath of routeModules) {
    it(`registers ${modulePath} exactly once with the server dependencies`, () => {
      const calls = registrations.get(modulePath) || [];
      expect(calls, `${modulePath} registration calls`).to.have.length(1);
      expect(calls[0]).to.have.length(3);
      expect(calls[0][0]).to.equal(logger);
      expect(calls[0][1]).to.equal(app);
      expect(calls[0][2]).to.equal(middleware);
    });
  }

  it('does not register missing or non-route v2 modules', () => {
    expect([...registrations.keys()].sort()).to.deep.equal(routeModules);
  });
});
