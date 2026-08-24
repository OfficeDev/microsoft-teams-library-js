import {
  createFile,
  decodeAttachment,
  isMediaCallForImageOutputFormats,
  isMediaCallForNonFullScreenVideoMode,
  isMediaCallForVideoAndImageInputs,
  validateGetMediaInputs,
  validatePeoplePickerInput,
  validateScanBarCodeInput,
  validateSelectMediaInputs,
  validateViewImagesInput,
} from '../../src/internal/mediaUtil';
import * as media from '../../src/public/media';
import * as people from '../../src/public/people';

/* eslint-disable */
/* As part of enabling eslint on test files, we need to disable eslint checking on the specific files with
   large numbers of errors. Then, over time, we can fix the errors and reenable eslint on a per file basis. */

describe('mediaUtil', () => {
  /**
   * Create FIle test cases
   */
  it('test createFile failure with null params', () => {
    const result = createFile(null, null);
    expect(result).toBeNull();
  });

  it('test createFile failure with null assembleAttachment', () => {
    const result = createFile(null, 'image/jpeg');
    expect(result).toBeNull();
  });

  it('test createFile failure with invalid params', () => {
    const result = createFile([], 'image/jpeg');
    expect(result).toBeNull();
  });

  it('test createFile success', () => {
    const assemble1: media.AssembleAttachment = decodeAttachment(
      {
        chunk: btoa('abc'),
        chunkSequence: 1,
      },
      'image/jpeg',
    );
    const assemble2: media.AssembleAttachment = decodeAttachment(
      {
        chunk: btoa('xyz'),
        chunkSequence: 2,
      },
      'image/jpeg',
    );
    const assembleAttachment: media.AssembleAttachment[] = [];
    assembleAttachment.push(assemble1);
    assembleAttachment.push(assemble2);
    const result = createFile(assembleAttachment, 'image/jpeg');
    expect(result).not.toBeNull();
  });

  /**
   * Decode attachment test cases
   */
  it('test decodeAttachment failure with null params', () => {
    const result = decodeAttachment(null, null);
    expect(result).toBeNull();
  });

  it('test decodeAttachment failure with null attachment', () => {
    const result = decodeAttachment(null, 'image/jpeg');
    expect(result).toBeNull();
  });

  it('test decodeAttachment failure with null mimetype', () => {
    const chunk: media.MediaChunk = {
      chunk: 'abc',
      chunkSequence: 1,
    };
    const result = decodeAttachment(chunk, null);
    expect(result).toBeNull();
  });

  it('test decodeAttachment success', () => {
    const chunk: media.MediaChunk = {
      chunk: btoa('abc'),
      chunkSequence: 1,
    };
    const result = decodeAttachment(chunk, 'image/jpeg');
    expect(result).not.toBeNull();
  });

  /**
   * Validate Select Media Input
   */
  it('test validateSelectMediaInputs failure with null param', () => {
    const result = validateSelectMediaInputs(null);
    expect(result).toBeFalsy();
  });

  it('test validateSelectMediaInputs failure with invalid param', () => {
    const mediaInput: media.MediaInputs = { mediaType: media.MediaType.Image, maxMediaCount: 50 };
    const result = validateSelectMediaInputs(mediaInput);
    expect(result).toBeFalsy();
  });

  it('test success case for validate select media input function', () => {
    const mediaInput: media.MediaInputs = { mediaType: media.MediaType.Image, maxMediaCount: 10 };
    const result = validateSelectMediaInputs(mediaInput);
    expect(result).toBeTruthy();
  });

  /**
   * Validate Get Media Input
   */
  it('test validateGetMediaInputs with all null params', () => {
    const result = validateGetMediaInputs(null, null, null);
    expect(result).toBeFalsy();
  });

  it('test validateGetMediaInputs with null format and content', () => {
    const result = validateGetMediaInputs('image/jpeg', null, null);
    expect(result).toBeFalsy();
  });

  it('test validateGetMediaInputs with null content', () => {
    const result = validateGetMediaInputs('image/jpeg', media.FileFormat.ID, null);
    expect(result).toBeFalsy();
  });

  it('test validateGetMediaInputs with invalid params', () => {
    const result = validateGetMediaInputs('image/jpeg', media.FileFormat.Base64, 'Something not null');
    expect(result).toBeFalsy();
  });

  it('test success case for validate get media input function', () => {
    const result = validateGetMediaInputs('image/jpeg', media.FileFormat.ID, 'Something not null');
    expect(result).toBeTruthy();
  });

  /**
   * Validate View Images Input
   */
  it('test validateViewImagesInput failure with null param', () => {
    const result = validateViewImagesInput(null);
    expect(result).toBeFalsy();
  });

  it('test validateViewImagesInput failure with invalid param', () => {
    const result = validateViewImagesInput([]);
    expect(result).toBeFalsy();
  });

  it('test success case for validateViewImagesInput', () => {
    const uriList: media.ImageUri[] = [];
    const imageUri: media.ImageUri = {
      type: media.ImageUriType.ID,
      value: 'Something not null',
    };
    uriList.push(imageUri);
    const result = validateViewImagesInput(uriList);
    expect(result).toBeTruthy();
  });

  /**
   * Validate People Picker selectPeople Input
   */
  it('test selectPeople success with null param', () => {
    const result = validatePeoplePickerInput(null);
    expect(result).toBeTruthy();
  });

  it('test selectPeople success with undefined param', () => {
    const result = validatePeoplePickerInput(undefined);
    expect(result).toBeTruthy();
  });

  it('test success case for selectPeople with valid input params', () => {
    const peoplePickerInputs: people.PeoplePickerInputs = {
      title: 'Hello World',
      setSelected: ['12345678'],
      openOrgWideSearchInChatOrChannel: true,
      singleSelect: true,
    };
    const result = validatePeoplePickerInput(peoplePickerInputs);
    expect(result).toBeTruthy();
  });

  it('test isMediaCallForImageOutputFormats success with valid params', () => {
    const mediaInput: media.MediaInputs = {
      mediaType: media.MediaType.Image,
      imageProps: { imageOutputFormats: [media.ImageOutputFormats.PDF] },
      maxMediaCount: 10,
    };
    const result = isMediaCallForImageOutputFormats(mediaInput);
    expect(result).toBeTruthy();
  });

  it('test isMediaCallForImageOutputFormats with null imageOutputParams', () => {
    const mediaInput: media.MediaInputs = { mediaType: media.MediaType.Image, maxMediaCount: 10 };
    const result = isMediaCallForImageOutputFormats(mediaInput);
    expect(result).toBeFalsy();
  });

  it('test isMediaCallForImageOutputFormats with null params', () => {
    const result = isMediaCallForImageOutputFormats(null);
    expect(result).toBeFalsy();
  });

  it('test isMediaCallForImageOutputFormats invalid params', () => {
    const mediaInput: media.MediaInputs = {
      mediaType: media.MediaType.Video,
      imageProps: { imageOutputFormats: [media.ImageOutputFormats.PDF] },
      maxMediaCount: 10,
    };
    const result = isMediaCallForImageOutputFormats(mediaInput);
    expect(result).toBeFalsy();
  });

  /**
   * Validate isMediaCallForVideoAndImageInputs
   */
  it('test isMediaCallForVideoAndImageInputs with null param', () => {
    const result = isMediaCallForVideoAndImageInputs(null);
    expect(result).toBeFalsy();
  });

  it('test isMediaCallForVideoAndImageInputs with undefined param', () => {
    const result = isMediaCallForVideoAndImageInputs(undefined);
    expect(result).toBeFalsy();
  });

  it('test isMediaCallForVideoAndImageInputs success with VideoAndImage media type', () => {
    const mediaInput: media.MediaInputs = { mediaType: media.MediaType.VideoAndImage, maxMediaCount: 10 };
    const result = isMediaCallForVideoAndImageInputs(mediaInput);
    expect(result).toBeTruthy();
  });

  it('test isMediaCallForVideoAndImageInputs success with videoAndImageProps on a non-VideoAndImage media type', () => {
    const mediaInput: media.MediaInputs = {
      mediaType: media.MediaType.Image,
      videoAndImageProps: { maxDuration: 10 },
      maxMediaCount: 10,
    };
    const result = isMediaCallForVideoAndImageInputs(mediaInput);
    expect(result).toBeTruthy();
  });

  it('test isMediaCallForVideoAndImageInputs with Image media type and no videoAndImageProps', () => {
    const mediaInput: media.MediaInputs = { mediaType: media.MediaType.Image, maxMediaCount: 10 };
    const result = isMediaCallForVideoAndImageInputs(mediaInput);
    expect(result).toBeFalsy();
  });

  it('test isMediaCallForVideoAndImageInputs with Video media type and no videoAndImageProps', () => {
    const mediaInput: media.MediaInputs = {
      mediaType: media.MediaType.Video,
      videoProps: {},
      maxMediaCount: 10,
    };
    const result = isMediaCallForVideoAndImageInputs(mediaInput);
    expect(result).toBeFalsy();
  });

  /**
   * Validate isMediaCallForNonFullScreenVideoMode
   */
  it('test isMediaCallForNonFullScreenVideoMode with null param', () => {
    const result = isMediaCallForNonFullScreenVideoMode(null);
    expect(result).toBeFalsy();
  });

  it('test isMediaCallForNonFullScreenVideoMode with undefined param', () => {
    const result = isMediaCallForNonFullScreenVideoMode(undefined);
    expect(result).toBeFalsy();
  });

  it('test isMediaCallForNonFullScreenVideoMode success with isFullScreenMode false', () => {
    const mediaInput: media.MediaInputs = {
      mediaType: media.MediaType.Video,
      videoProps: { isFullScreenMode: false },
      maxMediaCount: 10,
    };
    const result = isMediaCallForNonFullScreenVideoMode(mediaInput);
    expect(result).toBeTruthy();
  });

  it('test isMediaCallForNonFullScreenVideoMode success with isFullScreenMode omitted', () => {
    const mediaInput: media.MediaInputs = {
      mediaType: media.MediaType.Video,
      videoProps: {},
      maxMediaCount: 10,
    };
    const result = isMediaCallForNonFullScreenVideoMode(mediaInput);
    expect(result).toBeTruthy();
  });

  it('test isMediaCallForNonFullScreenVideoMode with isFullScreenMode true', () => {
    const mediaInput: media.MediaInputs = {
      mediaType: media.MediaType.Video,
      videoProps: { isFullScreenMode: true },
      maxMediaCount: 10,
    };
    const result = isMediaCallForNonFullScreenVideoMode(mediaInput);
    expect(result).toBeFalsy();
  });

  it('test isMediaCallForNonFullScreenVideoMode with Video media type and no videoProps', () => {
    const mediaInput: media.MediaInputs = { mediaType: media.MediaType.Video, maxMediaCount: 10 };
    const result = isMediaCallForNonFullScreenVideoMode(mediaInput);
    expect(result).toBeFalsy();
  });

  it('test isMediaCallForNonFullScreenVideoMode with non-Video media type', () => {
    const mediaInput: media.MediaInputs = {
      mediaType: media.MediaType.VideoAndImage,
      videoProps: { isFullScreenMode: false },
      maxMediaCount: 10,
    };
    const result = isMediaCallForNonFullScreenVideoMode(mediaInput);
    expect(result).toBeFalsy();
  });

  /**
   * Validate Scan BarCode Input
   */
  it('test validateScanBarCodeInput success with null param', () => {
    const result = validateScanBarCodeInput(null);
    expect(result).toBeTruthy();
  });

  it('test validateScanBarCodeInput success with undefined param', () => {
    const result = validateScanBarCodeInput(undefined);
    expect(result).toBeTruthy();
  });

  it('test validateScanBarCodeInput success with empty config', () => {
    const result = validateScanBarCodeInput({});
    expect(result).toBeTruthy();
  });

  it('test validateScanBarCodeInput success with undefined timeOutIntervalInSec', () => {
    const result = validateScanBarCodeInput({ timeOutIntervalInSec: undefined });
    expect(result).toBeTruthy();
  });

  it('test validateScanBarCodeInput failure with null timeOutIntervalInSec', () => {
    const result = validateScanBarCodeInput({ timeOutIntervalInSec: null });
    expect(result).toBeFalsy();
  });

  it('test validateScanBarCodeInput failure with timeOutIntervalInSec of 0', () => {
    const result = validateScanBarCodeInput({ timeOutIntervalInSec: 0 });
    expect(result).toBeFalsy();
  });

  it('test validateScanBarCodeInput failure with negative timeOutIntervalInSec', () => {
    const result = validateScanBarCodeInput({ timeOutIntervalInSec: -1 });
    expect(result).toBeFalsy();
  });

  it('test validateScanBarCodeInput success with lowest valid timeOutIntervalInSec', () => {
    const result = validateScanBarCodeInput({ timeOutIntervalInSec: 1 });
    expect(result).toBeTruthy();
  });

  it('test validateScanBarCodeInput success with highest valid timeOutIntervalInSec', () => {
    const result = validateScanBarCodeInput({ timeOutIntervalInSec: 60 });
    expect(result).toBeTruthy();
  });

  it('test validateScanBarCodeInput failure with timeOutIntervalInSec above the max', () => {
    const result = validateScanBarCodeInput({ timeOutIntervalInSec: 61 });
    expect(result).toBeFalsy();
  });
});
