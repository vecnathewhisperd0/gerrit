import static com.google.common.truth.Truth.assertWithMessage;
import com.google.gerrit.common.UsedAt;
import com.google.gerrit.common.UsedAt.Project;
import com.google.gerrit.entities.Account;
import com.google.gerrit.entities.Change;
import com.google.gerrit.entities.PatchSet;
import com.google.gerrit.server.approval.ApprovalsUtil;
import org.eclipse.jgit.dircache.DirCacheEditor.PathEdit;
import org.eclipse.jgit.dircache.DirCacheEntry;
import org.eclipse.jgit.lib.FileMode;
import org.eclipse.jgit.lib.ObjectId;
import org.eclipse.jgit.revwalk.RevBlob;
    PushOneCommit create(PersonIdent i, TestRepository<?> testRepo);
        PersonIdent i, TestRepository<?> testRepo, @Assisted("changeId") String changeId);
    @UsedAt(Project.PLUGIN_CODE_OWNERS)
    PushOneCommit create(
        PersonIdent i,
        TestRepository<?> testRepo,
        @Assisted("subject") String subject,
        @Assisted Map<String, String> files,
        @Assisted("changeId") String changeId);

    this(notesFactory, approvalsUtil, queryProvider, i, testRepo, SUBJECT, FILE_NAME, FILE_CONTENT);
    this(notesFactory, approvalsUtil, queryProvider, i, testRepo, subject, fileName, content, null);
    this(notesFactory, approvalsUtil, queryProvider, i, testRepo, subject, files, null);
  @AssistedInject
  PushOneCommit(
      @Assisted PersonIdent i,
      @Assisted TestRepository<?> testRepo,
      @Assisted("subject") String subject,
      @Assisted Map<String, String> files,
      @Nullable @Assisted("changeId") String changeId)
  public PushOneCommit noParent() throws Exception {
    commitBuilder.noParents();
    return this;
  }

  public PushOneCommit addSymlink(String path, String target) throws Exception {
    RevBlob blobId = testRepo.blob(target);
    commitBuilder.edit(
        new PathEdit(path) {
          @Override
          public void apply(DirCacheEntry ent) {
            ent.setFileMode(FileMode.SYMLINK);
            ent.setObjectId(blobId);
          }
        });
    return this;
  }

  public PushOneCommit addGitSubmodule(String modulePath, ObjectId commitId) {
    commitBuilder.edit(
        new PathEdit(modulePath) {
          @Override
          public void apply(DirCacheEntry ent) {
            ent.setFileMode(FileMode.GITLINK);
            ent.setObjectId(commitId);
          }
        });
    return this;
  }

  public PushOneCommit rmFile(String filename) {
    commitBuilder.rm(filename);
    return this;
  }

    public ChangeData getChange() {
    public PatchSet getPatchSet() {
    public PatchSet.Id getPatchSetId() {
        Change.Status expectedStatus, String expectedTopic, TestAccount... expectedReviewers) {
        List<TestAccount> expectedCcs) {
      assertReviewers(c, ReviewerStateInternal.REVIEWER, expectedReviewers);
      assertReviewers(c, ReviewerStateInternal.CC, expectedCcs);
        Change c, ReviewerStateInternal state, List<TestAccount> expectedReviewers) {
          approvalsUtil.getReviewers(notesFactory.createChecked(c)).byState(state);
      assertWithMessage(message(refUpdate))
          .that(refUpdate.getStatus())
      assertWithMessage(message(refUpdate)).that(refUpdate.getStatus()).isEqualTo(expectedStatus);