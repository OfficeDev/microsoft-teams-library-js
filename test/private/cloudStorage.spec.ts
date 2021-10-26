import {
  cloudStorage
} from "../../src/private/cloudStorage";
import { Utils } from "../utils";
import { _initialize, _uninitialize } from "../../src/public/publicAPIs";

describe("cloudStorage", () => {
  const utils = new Utils();
  const emptyCallback = () => { /** Nothing */ };

  beforeEach(() => {
    utils.processMessage = null;
    utils.messages = [];
    utils.childMessages = [];
    utils.childWindow.closed = false;
    utils.mockWindow.parent = utils.parentWindow;

    // Set a mock window for testing
    _initialize(utils.mockWindow);
  });

  afterEach(() => {
    // Reset the object since it"s a singleton
    if (_uninitialize) {
      _uninitialize();
    }
  });

  describe("getExternalProviders", () => {
    it("should trigger callback correctly", () => {
      utils.initializeWithContext("content");
      const mockExternalProviders: cloudStorage.IExternalProvider[] = [
        {
          name: "google",
          description: "google storage",
          thumbnails: [{
            size: 32,
            url: "string"
          }],
          navigationType: cloudStorage.FilesNavigationServiceType.PersonalGoogle,
          providerType: cloudStorage.FilesProviderType.Google,
          providerCode: "GOOGLEDRIVE"
        }
      ];

      const callback = jest.fn((err, providers) => {
        expect(err).toBeFalsy();
        expect(providers).toEqual(mockExternalProviders);
      });

      cloudStorage.getExternalProviders(false, callback);

      const getExternalProviders = utils.findMessageByFunc("cloudStorage.getExternalProviders");
      expect(getExternalProviders).not.toBeNull();
      utils.respondToMessage(getExternalProviders, false, mockExternalProviders);
      expect(callback).toHaveBeenCalled();
    });
  });

  describe("copyMoveFiles", () => {
    const mockSelectedFiles: cloudStorage.ICommonExternalDto[] = [
      {
        id: "123",
        lastModifiedTime: "2021-10-22T06:29:37.051Z",
        size: 32,
        objectUrl: "abc.com",
        title: "file",
        isSubdirectory: false,
        type: "type"
      }
    ];

    const mockDestinationFolder: cloudStorage.ICommonExternalDto = {
        id: "123",
        lastModifiedTime: "2021-10-22T06:29:37.051Z",
        size: 32,
        objectUrl: "abc.com",
        title: "file",
        isSubdirectory: false,
        type: "type"
    };

    const mockProviderCode = "DROPBOX";
    const destinationProviderCode = "GOOGLEDRIVE";

    it("should not allow calls before initialization", () => {
      expect(() => cloudStorage.copyMoveFiles(mockSelectedFiles, mockProviderCode, mockDestinationFolder, destinationProviderCode, false, emptyCallback)).toThrowError("The library has not yet been initialized");
    });

    it("should trigger callback correctly", () => {
      utils.initializeWithContext("content");

      const callback = jest.fn((err) => {
        expect(err).toBeFalsy();
      });

      cloudStorage.copyMoveFiles(mockSelectedFiles, mockProviderCode, mockDestinationFolder, destinationProviderCode, false, callback);
      const copyMoveFilesMessage = utils.findMessageByFunc("cloudStorage.copyMoveFiles");
      expect(copyMoveFilesMessage).not.toBeNull();
      utils.respondToMessage(copyMoveFilesMessage, false);
      expect(callback).toHaveBeenCalled();
    });
  });

});
