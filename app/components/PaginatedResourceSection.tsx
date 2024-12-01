import * as React from 'react';
import {Pagination} from '@shopify/hydrogen';

/**
 * <PaginatedResourceSection > is a component that encapsulate how the previous and next behaviors throughout your application.
 */

export function PaginatedResourceSection<NodesType>({
  connection,
  children,
  resourcesClassName,
}: {
  connection: React.ComponentProps<typeof Pagination<NodesType>>['connection'];
  children: React.FunctionComponent<{node: NodesType; index: number}>;
  resourcesClassName?: string;
}) {
  return (
    <Pagination connection={connection}>
      {({nodes, isLoading, PreviousLink, NextLink}) => {
        const resoucesMarkup = nodes.map((node, index) =>
          children({node, index}),
        );

        return (
            <div className="my-16 pb-8 text-center">
              {PreviousLink && (
                  <div className="pagination-link">
                    <PreviousLink className="inline-block mb-10 rounded-lg background-blue py-3 px-5">
                      {isLoading ? 'Loading...' : <span>↑ Load previous</span>}
                    </PreviousLink>
                  </div>
              )}
              <div className={resourcesClassName || 'blog-grid'}>
                {resoucesMarkup}
              </div>
              {NextLink && (
                  <div className="pagination-link">
                    <NextLink className="inline-block mt-10 rounded-lg background-blue py-3 px-5">
                      {isLoading ? 'Loading...' : <span>Load more ↓</span>}
                    </NextLink>
                  </div>
              )}
            </div>
        );
      }}
    </Pagination>
  );
}
