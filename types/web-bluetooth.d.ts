// Web Bluetooth API Type Definitions
// Source: https://github.com/DefinitelyTyped/DefinitelyTyped/blob/master/types/web-bluetooth/index.d.ts

interface BluetoothRequestDeviceFilter {
    services?: (string | number)[];
    name?: string;
    namePrefix?: string;
    manufacturerData?: [{ companyIdentifier: number; dataPrefix?: BufferSource; mask?: BufferSource }];
    serviceData?: [{ service: string | number; dataPrefix?: BufferSource; mask?: BufferSource }];
}

interface RequestDeviceOptions {
    filters?: BluetoothRequestDeviceFilter[];
    optionalServices?: (string | number)[];
    acceptAllDevices?: boolean;
}

interface BluetoothRemoteGATTDescriptor {
    readonly characteristic: BluetoothRemoteGATTCharacteristic;
    readonly uuid: string;
    readonly value?: DataView;
    readValue(): Promise<DataView>;
    writeValue(value: BufferSource): Promise<void>;
}

interface BluetoothCharacteristicProperties {
    readonly broadcast: boolean;
    readonly read: boolean;
    readonly writeWithoutResponse: boolean;
    readonly write: boolean;
    readonly notify: boolean;
    readonly indicate: boolean;
    readonly authenticatedSignedWrites: boolean;
    readonly reliableWrite: boolean;
    readonly writableAuxiliaries: boolean;
}

interface BluetoothRemoteGATTCharacteristic extends EventTarget {
    readonly service: BluetoothRemoteGATTService;
    readonly uuid: string;
    readonly properties: BluetoothCharacteristicProperties;
    readonly value?: DataView;
    getDescriptor(descriptor: string | number): Promise<BluetoothRemoteGATTDescriptor>;
    getDescriptors(descriptor?: string | number): Promise<BluetoothRemoteGATTDescriptor[]>;
    readValue(): Promise<DataView>;
    writeValue(value: BufferSource): Promise<void>;
    writeValueWithResponse(value: BufferSource): Promise<void>;
    writeValueWithoutResponse(value: BufferSource): Promise<void>;
    startNotifications(): Promise<BluetoothRemoteGATTCharacteristic>;
    stopNotifications(): Promise<BluetoothRemoteGATTCharacteristic>;
    addEventListener(type: "characteristicvaluechanged", listener: (this: this, ev: Event) => any, useCapture?: boolean): void;
    addEventListener(type: string, listener: EventListenerOrEventListenerObject, useCapture?: boolean): void;
}

interface BluetoothRemoteGATTService extends EventTarget {
    readonly device: BluetoothDevice;
    readonly uuid: string;
    readonly isPrimary: boolean;
    getCharacteristic(characteristic: string | number): Promise<BluetoothRemoteGATTCharacteristic>;
    getCharacteristics(characteristic?: string | number): Promise<BluetoothRemoteGATTCharacteristic[]>;
    getIncludedService(service: string | number): Promise<BluetoothRemoteGATTService>;
    getIncludedServices(service?: string | number): Promise<BluetoothRemoteGATTService[]>;
}

interface BluetoothRemoteGATTServer extends EventTarget {
    readonly device: BluetoothDevice;
    readonly connected: boolean;
    connect(): Promise<BluetoothRemoteGATTServer>;
    disconnect(): void;
    getPrimaryService(service: string | number): Promise<BluetoothRemoteGATTService>;
    getPrimaryServices(service?: string | number): Promise<BluetoothRemoteGATTService[]>;
}

interface BluetoothDevice extends EventTarget {
    readonly id: string;
    readonly name?: string;
    readonly gatt?: BluetoothRemoteGATTServer;
    readonly watchingAdvertisements: boolean;
    watchAdvertisements(options?: any): Promise<void>;
    unwatchAdvertisements(): void;
    readonly uui?: string; // typo in spec?
    addEventListener(type: "gattserverdisconnected", listener: (this: this, ev: Event) => any, useCapture?: boolean): void;
    addEventListener(type: "advertisementreceived", listener: (this: this, ev: Event) => any, useCapture?: boolean): void;
    addEventListener(type: string, listener: EventListenerOrEventListenerObject, useCapture?: boolean): void;
}

interface Bluetooth extends EventTarget {
    getAvailability(): Promise<boolean>;
    requestDevice(options?: RequestDeviceOptions): Promise<BluetoothDevice>;
}

interface Navigator {
    bluetooth: Bluetooth;
}
