export class Prompts {
  reviewFilePrompt = `## Instructions

    The format for changes provided in the example below consists of
    multiple change sections, each containing a new hunk (annotated with
    line numbers), an old hunk, and optionally, existing comment chains.
    Note that the old hunk code has been replaced by the new hunk. Some
    lines on the new hunk may be annotated with line numbers.

    Your task is to meticulously perform line-by-line review of new hunks,
    identifying substantial issues only. Respond only in the below example format,
    consisting of review sections. Each review section must have a line number range
    and a review comment for that range. Use separator after each review section.
    Line number ranges for each review section must be within the range of a specific
    new hunk. Start line number must belong to the same hunk as the end line number.
    Provide the exact line number range (inclusive) for each review comment. To leave
    a review comment on a single line, use the same line number for start and end.

    Take into consideration the context provided by old hunks, comment threads, and
    file content during your review. Remember, the hunk under review is a fragment of a
    larger codebase and may not show all relevant sections, such as definitions,
    imports, or usage of functions or variables. Expect incomplete code fragments or
    references to elements defined beyond the provided context. Do NOT flag missing
    definitions, imports, or usages unless the context strongly suggests an issue.
    Do NOT restate information readily apparent in the code or the pull request.
    Do NOT provide general feedback, summaries, explanations of changes, or praises
    for making good additions. Do NOT question the developer's intentions behind the
    changes or warn them about potential compatibility issues with other dependencies.
    Avoid making assumptions about broader impacts beyond the given context or the
    necessity of the changes. Do NOT request the developer to review their changes.
    Given your knowledge may be outdated, it is essential to trust the developer when
    they appear to utilize newer APIs and methods. Presume the developer has
    exhaustively tested their changes and is fully aware of their system-wide
    implications. Focus solely on offering specific, objective insights based on the
    actual code and refrain from making broad comments about potential impacts on
    the system.

    Use GitHub flavored markdown format for review comment text
    and fenced code blocks for code snippets using the relevant
    language identifier. Do NOT annotate the code snippet with
    line numbers. The code snippet must be correctly
    formatted & indented.

    If applicable, you may provide a replacement snippet to fix
    issues within a hunk by using \`diff\` code blocks, clearly
    marking the lines that need to be added or removed with \`+\`
    and \`-\` annotations. The line number range for the review
    comment that includes a replacement snippet must precisely map
    to the line number range that has to be completely replaced
    within a hunk. Do NOT use \`suggestion\` code blocks for
    replacement snippets.

    If there are no issues found on a line range, you MUST respond with the
    text \`LGTM!\` for that line range in the review section.

    Reflect on your comments thoroughly before posting them to
    ensure accuracy and compliance with the above guidelines.

    ## Example

    ### Example changes

    ---new_hunk---
    \`\`\`
      z = x / y
        return z

    20: def add(x, y):
    21:     z = x + y
    22:     retrn z
    23:
    24: def multiply(x, y):
    25:     return x * y

    def subtract(x, y):
      z = x - y
    \`\`\`

    ---old_hunk---
    \`\`\`
      z = x / y
        return z

    def add(x, y):
        return x + y

    def subtract(x, y):
        z = x - y
    \`\`\`

    ---comment_chains---
    \`\`\`
    Please review this change.
    \`\`\`

    ---end_change_section---

    ### Example response

    22-22:
    There's a syntax error in the add function.
    \`\`\`diff
    -    retrn z
    +    return z
    \`\`\`
    ---
    24-25:
    LGTM!
    ---

    ## Changes made to \`$filename\` for your review

    $patch
    `;
}
