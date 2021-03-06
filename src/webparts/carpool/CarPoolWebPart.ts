import * as React from 'react';
import * as ReactDom from 'react-dom';
import { Version } from '@microsoft/sp-core-library';
import {
  IPropertyPaneConfiguration,
  PropertyPaneTextField
} from '@microsoft/sp-property-pane';
import { BaseClientSideWebPart } from '@microsoft/sp-webpart-base';

import * as strings from 'CarPoolWebPartStrings';
import CarPool from './components/CarPool';
import { ICarPoolProps } from './components/ICarPoolProps';
import * as jQuery from "jquery";

export interface ICarPoolWebPartProps {
  description: string;
}

export default class CarPoolWebPart extends BaseClientSideWebPart <ICarPoolWebPartProps> {
  
  public render(): void {
    const element: React.ReactElement<ICarPoolProps> = React.createElement(
      CarPool,
      {
        spHttpClient:this.context.spHttpClient
      }
    );

    ReactDom.render(element, this.domElement);
  }
  public onInit(): Promise<void> {
    return super.onInit().then(_ => {
        jQuery("#workbenchPageContent").prop("style", "max-width: none");
        jQuery(".SPCanvas-canvas").prop("style", "max-width: none");
        jQuery(".CanvasZone").prop("style", "max-width: none");
    });
}
  protected onDispose(): void {
    ReactDom.unmountComponentAtNode(this.domElement);
  }

  protected get dataVersion(): Version {
    return Version.parse('1.0');
  }

  protected getPropertyPaneConfiguration(): IPropertyPaneConfiguration {
    return {
      pages: [
        {
          header: {
            description: strings.PropertyPaneDescription
          },
          groups: [
            {
              groupName: strings.BasicGroupName,
              groupFields: [
                PropertyPaneTextField('description', {
                  label: strings.DescriptionFieldLabel
                })
              ]
            }
          ]
        }
      ]
    };
  }
}
