const path = require('path');
const { argv } = require('yargs')
  .option('adoAccessToken', {
    string: true,
    demandOption: false,
    description: 'The ado access token is required to connect with the repo',
  })
  .option('pullRequestId', {
    number: true,
    description: 'The pull request id against to run this js',
  })
  .option('commitId', {
    string: true,
    demandOption: false,
    description: 'The commit id of the current',
  });

const { ADOSizeComparator, getAzureDevopsApi, bundlesContainNoChanges } = require('bundle-size-tools');

/**
 * This script compares the bundle analysis between the base commit from which PR was branched off and current commit
 */
(async () => {
  // PR ci runs bundle analyze and collect analyses for current branch
  // This script creates bundle summary for both commits and compare
  // Then it posts the summary as an output variable of Azure devops task which is used by other task to post comment in respective PR

  const adoAccessToken = argv.adoAccessToken;
  const pullRequestId = argv.pullRequestId;
  const currentCommitId = argv.commitId;

  console.log(`Logging token : ${adoAccessToken} for pr : ${pullRequestId}`);
  const adoConstants = {
    orgUrl: 'https://office.visualstudio.com',
    projectName: 'ISS',
    ciBuildDefinitionId: 13173,
    bundleAnalysisArtifactName: 'bundle-analysis-reports',
  };

  const localReportPath = path.resolve(process.cwd(), './common/temp/bundleAnalysis');

  const adoConnection = getAzureDevopsApi(adoAccessToken, adoConstants.orgUrl);
  const sizeComparator = new ADOSizeComparator(
    adoConstants,
    adoConnection,
    localReportPath,
    undefined,
    ADOSizeComparator.naiveFallbackCommitGenerator,
  );
  const result = await sizeComparator.createSizeComparisonMessage(false);

  if (result === undefined || result.comparison === undefined) {
    throw new Error('An Error occurred : ' + result.message);
  } else if (bundlesContainNoChanges(result.comparison)) {
    console.log('No size change detected');
  }

  const prCommentMsg = `<p>Analyzed commit id : ${currentCommitId}</p><hr>${result.message}`;
  console.log(prCommentMsg);

  // Sets result in Azure devops pipeline output variable 'bundleAnalysisComment'
  console.log(`##vso[task.setvariable variable=bundleAnalysisComment;isOutput=true]${prCommentMsg}`);
})();
