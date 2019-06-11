import * as React from 'react';
import { Link } from 'react-router-dom';
import { ArbiterModule } from 'react-arbiter';
import {
  PageComponentProps,
  PiralApi,
  ExtensionComponentProps,
  TileComponentProps,
  ErrorInfoProps,
  MenuComponentProps,
} from 'piral-core';

/**
 * Shows the general usage of the `setup` function together
 * with some tile and page registrations.
 * Also registeres some custom error page handlers. For details
 * on this, see DashboardModule.
 */
export const Pilet1: ArbiterModule<PiralApi> = {
  content: '',
  dependencies: {},
  name: 'Example Module',
  version: '1.0.0',
  hash: '1',
  setup(piral) {
    console.log(piral);

    piral.registerTileX('example-general', (element, props) => {
      element.innerHTML = `
        <div class="tile">
          General rendering for a ${props.columns}x${props.rows} tile.
        </div>
      `;
    });

    piral.registerTile(
      'example-react',
      class extends React.Component<TileComponentProps<PiralApi>> {
        render() {
          return <div className="tile">Rendered a tile from React.</div>;
        }
      },
    );

    piral.registerMenu(
      'example',
      class extends React.Component<MenuComponentProps<PiralApi>> {
        render() {
          return <Link to="http://www.google.com">Google</Link>;
        }
      },
      { type: 'general' },
    );

    piral.registerPage(
      '/example1',
      class extends React.Component<PageComponentProps<PiralApi>> {
        render() {
          return (
            <div>
              <p>
                This is the first <b>example</b> page
              </p>
              <p>Click for a notification.</p>
              <ul>
                <li>
                  <button onClick={() => piral.showNotification('Hello there!')}>Notify me! (Default)</button>
                </li>
                <li>
                  <button onClick={() => piral.showNotification('Hello there!', { type: 'error' })}>
                    Notify me! (Error)
                  </button>
                </li>
                <li>
                  <button onClick={() => piral.showNotification('Hello there!', { title: 'Some title' })}>
                    Notify me! (With Title)
                  </button>
                </li>
                <li>
                  <button onClick={() => piral.showNotification('Hello there!', { autoClose: 1000, type: 'success' })}>
                    Notify me! (1s)
                  </button>
                </li>
                <li>
                  <button
                    onClick={() =>
                      piral.showNotification(
                        <span>
                          Hello there; this is <b>some longer text</b>!
                        </span>,
                        { autoClose: 1500, type: 'warning' },
                      )
                    }>
                    Notify me! (longer, formatted text 1.5s)
                  </button>
                </li>
              </ul>
            </div>
          );
        }
      },
    );

    piral.registerPage(
      '/example2',
      class extends React.Component<PageComponentProps<PiralApi>> {
        render() {
          return (
            <div>
              <p>
                This is the second <b>example</b> page
              </p>
              <p>
                IF YOU ARE IN AN ADVENTUROUS MOOD TRY{' '}
                <a
                  onClick={e => {
                    piral.unregisterPage('/example2');
                    e.preventDefault();
                  }}
                  href="#">
                  THIS LINK
                </a>
                .
              </p>
            </div>
          );
        }
      },
    );

    piral.registerExtension(
      'error',
      class extends React.Component<ExtensionComponentProps<PiralApi, ErrorInfoProps>> {
        render() {
          return <div>Custom Error page</div>;
        }
      },
    );

    piral.registerExtension(
      'error',
      class extends React.Component<ExtensionComponentProps<PiralApi, ErrorInfoProps>> {
        render() {
          if (this.props.params.type === 'not_found') {
            return <div>The page was not found!!!</div>;
          }
          return false;
        }
      },
    );
  },
};
