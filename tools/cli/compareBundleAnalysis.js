const path = require('path');
const { argv } = require('yargs')
  .option('commitId', {
    string: true,
    demandOption: false,
    description: 'The commit id of the current changes',
  })
  .option('orgUrl', {
    string: true,
    demandOption: true,
    description: 'Organisation',
  })
  .option('projectName', {
    string: true,
    demandOption: true,
    description: 'Project name',
  })
  .option('buildId', {
    number: true,
    demandOption: true,
    description: 'Build definition id',
  })
  .option('bundleArtifactName', {
    string: true,
    demandOption: true,
    description: 'Artifact name of the bundle',
  })
  .option('baseBranchName', {
    string: true,
    demandOption: true,
    description: "Destination branch against which current Pull request's bundle size is compared",
  });

const { ADOSizeComparator, getAzureDevopsApi, bundlesContainNoChanges } = require('../bundle-size-tools');

/**
 * This script compares the bundle analysis between the base commit from which PR was branched off and current commit
 */
(async () => {
  // PR ci runs bundle analyze and collect analyses for current branch
  // This script creates bundle summary for both commits and compare
  // Then it posts the summary as an output variable of Azure devops task which is used by other task to post comment in respective PR

  const adoAccessToken = process.env.SYSTEM_ACCESSTOKEN;
  const currentCommitId = argv.commitId;
  const baseBranchName = argv.baseBranchName;
  const adoConstants = {
    orgUrl: argv.orgUrl,
    projectName: argv.projectName,
    ciBuildDefinitionId: argv.buildId,
    bundleAnalysisArtifactName: argv.bundleArtifactName,
  };

  const localReportPath = path.resolve(process.cwd(), './common/temp/bundleAnalysis');

  let prCommentMsg = '';
  try {
    const adoConnection = getAzureDevopsApi(adoAccessToken, adoConstants.orgUrl);
    const sizeComparator = new ADOSizeComparator(
      adoConstants,
      adoConnection,
      localReportPath,
      undefined,
      baseBranchName,
      ADOSizeComparator.naiveFallbackCommitGenerator,
    );
    const result = await sizeComparator.createSizeComparisonMessage(false);

    if (result === undefined || result.comparison === undefined) {
      prCommentMsg = 'Failed to compute bundle size changes with error: ' + result.message;
    } else if (bundlesContainNoChanges(result.comparison)) {
      prCommentMsg = 'No size change detected';
    } else {
      prCommentMsg = `<p>Analyzed commit id : ${currentCommitId}</p><hr>${result.message}`;
    }

    console.log(prCommentMsg);
  } catch (err) {
    // Printing error in pipeline
    console.log(err);
    prCommentMsg = 'Unknown error occurred. Pls see logs in the pipeline for more info';
  }
  // Sets result in Azure devops pipeline output variable 'bundleAnalysisComment'
  console.log(`##vso[task.setvariable variable=bundleAnalysisComment;isOutput=true]${prCommentMsg}`);
})();
