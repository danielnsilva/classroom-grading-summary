import { getOctokit } from '@actions/github';
import { Context } from '@actions/github/lib/context';

type Octokit = ReturnType<typeof getOctokit>;

async function findFeedbackPR(octokit: Octokit, context: Context): Promise<{ number: number } | undefined | null> {
  try {
    const { data: pulls } = await octokit.rest.pulls.list({
      owner: context.repo.owner,
      repo: context.repo.repo,
      state: 'open'
    });
    
    const feedbackPR = pulls.find(pr => 
      pr.title.toLowerCase().includes('feedback') || 
      pr.head.ref.includes('feedback')
    );
    
    return feedbackPR;
  } catch (error) {
    console.log('Error fetching PRs:', error instanceof Error ? error.message : String(error));
    return null;
  }
}

export async function updatePRComment(octokit: Octokit, context: Context, report: string, updateExisting = true): Promise<void> {
  const feedbackPR = await findFeedbackPR(octokit, context);
  
  if (!feedbackPR) {
    console.log('Feedback PR not found. Skipping update.');
    return;
  }
  
  const commentMarker = '<!-- CLASSROOM-GRADING-SUMMARY -->';
  const commentBody = `${commentMarker}\n${report}`;
  
  try {
    const { data: comments } = await octokit.rest.issues.listComments({
      owner: context.repo.owner,
      repo: context.repo.repo,
      issue_number: feedbackPR.number
    });
    
    const existingComments = comments.filter(comment => 
      comment.body?.includes(commentMarker)
    );
    const existingComment = existingComments[existingComments.length - 1];
    
    if (existingComment && updateExisting) {
      await octokit.rest.issues.updateComment({
        owner: context.repo.owner,
        repo: context.repo.repo,
        comment_id: existingComment.id,
        body: commentBody
      });
      console.log(`Comment updated in PR #${feedbackPR.number}`);
    } else {
      await octokit.rest.issues.createComment({
        owner: context.repo.owner,
        repo: context.repo.repo,
        issue_number: feedbackPR.number,
        body: commentBody
      });
      console.log(`New comment created in PR #${feedbackPR.number}`);
    }
  } catch (error) {
    console.log('Error updating PR comment:', error instanceof Error ? error.message : String(error));
    console.log('Continuing without PR update...');
  }
}
