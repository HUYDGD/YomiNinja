import "reflect-metadata";

import { Container } from "inversify";


export const container_registry = new Container();

export const Registry = {

    // Adapters
    PpOcrAdapter: Symbol.for('PpOcrAdapter'),

    // Use Cases
    RecognizeImageUseCase: Symbol.for('RecognizeImageUseCase'),
    GetSupportedLanguagesUseCase: Symbol.for('GetSupportedLanguagesUseCase'),
}

import "./adapters_registry";
import "./use_cases_registry";