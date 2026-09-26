import type { GovernmentConnector } from "./connector.interface";
import { EducationConnector } from "./educationConnector";
import { TransportConnector } from "./transportConnector";
import { UtilityConnector } from "./utilityConnector";
import { FinanceConnector } from "./financeConnector";
import { HealthConnector } from "./healthConnector";
import { CitizenServicesConnector } from "./citizenServicesConnector";

class ConnectorRegistry {
  private connectors = new Map<string, GovernmentConnector>();

  constructor() {
    this.register(new EducationConnector());
    this.register(new TransportConnector());
    this.register(new UtilityConnector());
    this.register(new FinanceConnector());
    this.register(new HealthConnector());
    this.register(new CitizenServicesConnector());
  }

  register(connector: GovernmentConnector) {
    this.connectors.set(connector.connectorId, connector);
  }

  get(connectorId: string): GovernmentConnector | undefined {
    return this.connectors.get(connectorId);
  }

  getAll(): GovernmentConnector[] {
    return Array.from(this.connectors.values());
  }
}

export const connectorRegistry = new ConnectorRegistry();
