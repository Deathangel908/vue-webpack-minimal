import {Action, Module, Mutation, VuexModule, getModule} from "vuex-module-decorators";
import {AlertModel, AlertType} from "@/types/model";
import {getUniqueId, sleep} from "@/utils/helpers";
import {ApiConsts} from "@/utils/consts";
import {IAlertsState} from "@/types/store";
import {stateDecoratorFactory} from "@/store/stateDecoratorFactory";
import {store} from "@/store/store";

/**
 * Main vuex module which shares state across multiple vue components.
 * This is required to avoid hunders of VueBuses when state sharing is required
 */
@Module({
  dynamic: true,
  name: "alerts",
  store,
})
class DefaultStore extends VuexModule implements IAlertsState {
  public alerts: AlertModel[] = [];

  @Mutation
  public addAlert(growlModel: AlertModel): void {
    this.alerts.push(growlModel);
  }

  @Mutation
  public removeAlert(growlModel: AlertModel): void {
    const index = this.alerts.indexOf(growlModel, 0);
    this.alerts.splice(index, 1);
  }

  @Mutation
  public cleanAlerts(): void {
    this.alerts = [];
  }

  @Action({rawError: true})
  public async showAlert({text, type}: { text: string; type: AlertType}): Promise<void> {
    const alert: AlertModel = {
      id: getUniqueId(),
      text,
      type,
    };
    // Don't show too many errors
    if (this.alerts.length > ApiConsts.MAX_ERROR_NUMBER - 1) {
      this.alerts.shift();
    }
    this.addAlert(alert);
    // Hide alert after 30s automatically
    await sleep(ApiConsts.DISPLAY_ALERTS_MS);
    this.removeAlert(alert);
  }

  @Action
  public async alertError(text: string): Promise<void> {
    await this.showAlert({
      text,
      type: "error",
    });
  }

  @Action
  public async alertSuccess(text: string): Promise<void> {
    await this.showAlert({
      text,
      type: "success",
    });
  }
}

const alertsModule: DefaultStore = getModule(DefaultStore);

/*
 * TPN - TypePropertyName
 * TCT - TypeConsumerType
 * the generics bellow are inherited strictly from stateDecoratorFactory, see its docs
 */
const AlertsState: <TCT extends (TCT[TPN] extends DefaultStore[TPN] ? unknown : never),
  TPN extends (keyof TCT & keyof DefaultStore)>(vueComponent: TCT, fileName: TPN) => void =
    stateDecoratorFactory(alertsModule);

export {alertsModule, AlertsState};
