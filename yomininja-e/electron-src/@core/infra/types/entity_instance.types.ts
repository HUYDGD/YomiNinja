import { SettingsPreset, SettingsPresetProps } from "../../domain/settings_preset/settings_preset";
import { CloudVisionOcrEngineSettings } from "../ocr/cloud_vision_ocr.adapter/cloud_vision_ocr_settings";
import { PpOcrEngineSettings } from "../ocr/ppocr.adapter/ppocr_settings";
import { FakeOcrEngineSettings } from "../test/fake_ocr.adapter/fake_ocr.adapter";

// Ocr engine settings union type
export type OcrEngineSettingsU = PpOcrEngineSettings | CloudVisionOcrEngineSettings;

export type SettingsPresetInstanceProps = SettingsPresetProps< OcrEngineSettingsU >;

export type SettingsPresetInstance = SettingsPreset< SettingsPresetInstanceProps >;