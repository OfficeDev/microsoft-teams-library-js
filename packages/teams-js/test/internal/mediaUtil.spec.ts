import {
  createFile,
  decodeAttachment,
  isMediaCallForImageOutputFormats,
  validateGetMediaInputs,
  validatePeoplePickerInput,
  validateSelectMediaInputs,
  validateViewImagesInput,
} from '../../src/internal/mediaUtil';
import { media } from '../../src/public/media';
import { people } from '../../src/public/people';

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
});
