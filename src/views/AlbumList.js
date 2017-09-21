import React, { PureComponent, PropTypes as T } from 'react';

export default class AlbumList extends PureComponent {
  static propTypes = {
    albums: T.arrayOf(
      T.object
    ),
    albumId: T.number,
    onAlbumIdChange: T.func
  };

  constructor () {
    super();
  }

  onAlbumIdChange = (event) => {
    const { value } = event.target;
    const { onAlbumIdChange } = this.props;

    if (onAlbumIdChange instanceof Function) {
      const newId = value && value !== '' ? Number(value) : undefined;

      onAlbumIdChange(newId);
    }
  };

  render () {
    const { albums, albumId } = this.props;

    return (
      <div>
        <h2>Albums:</h2>
        <input
          type="number"
          value={albumId}
          onChange={this.onAlbumIdChange}
        />
        <input
          type="number"
          value={albumId}
          onChange={this.onAlbumIdChange}
        />
        <br/>
        {(albums || []).map(a => {
          return (
            <div key={`Album:${a.id}`}>{a.title}</div>
          );
        })}
      </div>
    );
  }
}
