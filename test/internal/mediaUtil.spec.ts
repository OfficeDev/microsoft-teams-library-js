import { validateSelectMediaInputs, validateGetMediaInputs, validateViewImagesInput, decodeAttachment, createFile } from '../../src/internal/mediaUtil';
import { MediaInputs, MediaType, FileFormat, ImageUri, ImageUriType, MediaChunk, AssembleAttachment } from '../../src/public/media';

describe('mediaUtil', () => {

  /**
   * Create FIle test cases
   */
  it('test createFile failure with null params', () => {
    const result = createFile(null, null);
    expect(result).toBeNull();
  });

  it('test createFile failure with null assembleAttachment', () => {
    const result = createFile(null, "image/jpeg");
    expect(result).toBeNull();
  });

  it('test createFile failure with invalid params', () => {
    const result = createFile([], "image/jpeg");
    expect(result).toBeNull();
  });

  it('test createFile success', () => {
    const assemble1: AssembleAttachment = decodeAttachment({
      chunk: btoa("abc"),
      chunkSequence: 1
    }, "image/jpeg");
    const assemble2: AssembleAttachment = decodeAttachment({
      chunk: btoa("xyz"),
      chunkSequence: 2
    }, "image/jpeg");
    const assembleAttachment: AssembleAttachment[] = [];
    assembleAttachment.push(assemble1);
    assembleAttachment.push(assemble2);
    const result = createFile(assembleAttachment, "image/jpeg");
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
    const result = decodeAttachment(null, "image/jpeg");
    expect(result).toBeNull();
  });

  it('test decodeAttachment failure with null mimetype', () => {
    const chunk: MediaChunk = {
      chunk: "abc",
      chunkSequence: 1
    };
    const result = decodeAttachment(chunk, null);
    expect(result).toBeNull();
  });

  it('test decodeAttachment success', () => {
    const chunk: MediaChunk = {
      chunk: btoa("abc"),
      chunkSequence: 1
    };
    const result = decodeAttachment(chunk, "image/jpeg");
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
    const mediaInput: MediaInputs = { mediaType: MediaType.Image, maxMediaCount: 50 };
    const result = validateSelectMediaInputs(mediaInput);
    expect(result).toBeFalsy();
  });

  it('test success case for validate select media input function', () => {
    const mediaInput: MediaInputs = { mediaType: MediaType.Image, maxMediaCount: 10 };
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
    const result = validateGetMediaInputs("image/jpeg", null, null);
    expect(result).toBeFalsy();
  });

  it('test validateGetMediaInputs with null content', () => {
    const result = validateGetMediaInputs("image/jpeg", FileFormat.ID, null);
    expect(result).toBeFalsy();
  });

  it('test validateGetMediaInputs with invalid params', () => {
    const result = validateGetMediaInputs("image/jpeg", FileFormat.Base64, "Something not null");
    expect(result).toBeFalsy();
  });

  it('test success case for validate get media input function', () => {
    const result = validateGetMediaInputs("image/jpeg", FileFormat.ID, "Something not null");
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
    const uriList: ImageUri[] = [];
    const imageUri: ImageUri = {
      type: ImageUriType.ID,
      value: "Something not null"
    }
    uriList.push(imageUri);
    const result = validateViewImagesInput(uriList);
    expect(result).toBeTruthy();
  });
});