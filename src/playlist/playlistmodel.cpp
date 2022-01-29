#include "playlistmodel.h"
#include <QSize>
PlaylistModel::PlaylistModel(QObject *parent) : QAbstractTableModel{parent} {}

int PlaylistModel::rowCount(const QModelIndex &parent) const { return m_data.count(); }

int PlaylistModel::columnCount(const QModelIndex &parent) const { return 5; }

QVariant PlaylistModel::data(const QModelIndex &index, int role) const {
  if (role == Qt::ItemDataRole::TextAlignmentRole) {
  }
  if (role == Qt::ItemDataRole::DisplayRole) {
    PlayListItem item = m_data[index.row()];
    switch (index.column()) {
    case 0:
      return item.trackNumber;
    case 1:
      return item.title;
    case 2:
      return item.artist;
    case 3:
      return item.duration;
      case 4:
      return item.csvUrl.fileName();
    default:
      return QVariant();
    }
  }
  return QVariant();
}

QVariant PlaylistModel::headerData(int section, Qt::Orientation orientation, int role) const {
  if (role == Qt::ItemDataRole::SizeHintRole) {
    switch (section) {
    case 0:
      return QSize(10, 10);
    case 1:
      return QSize(30, 10);
    case 2:
      return QSize(30, 10);
    case 3:
      return QSize(40, 10);
    default:
      return QSize(50, 10);
    }
  }
  if (role == Qt::ItemDataRole::DisplayRole && orientation == Qt::Horizontal) {
    switch (section) {
    case 0:
      return QStringLiteral("#");
    case 1:
      return QStringLiteral("title");
    case 2:
      return QStringLiteral("artist");
    case 3:
      return QStringLiteral("duration");
      case 4:
      return QStringLiteral("CSV");
    default:
      return QVariant();
    }
  }
  return QVariant();
}

QUrl PlaylistModel::getUrl(const QModelIndex &index) const { return m_data[index.row()].url; }

void PlaylistModel::addAudioFile(QString file_name) {

  beginInsertRows(QModelIndex(), m_data.count(), m_data.count());
  auto url = QUrl::fromLocalFile(file_name);
  auto *meta_reader = new QMediaPlayer();
  meta_reader->setSource(url);
  connect(meta_reader, &QMediaPlayer::mediaStatusChanged, [=] {
    auto status = meta_reader->mediaStatus();
    if (status == QMediaPlayer::LoadedMedia) {
      QMediaMetaData meta = meta_reader->metaData();
      auto title = meta.value(QMediaMetaData::Key::Title);
      auto album = meta.value(QMediaMetaData::Key::AlbumTitle);
      auto artist = meta.value(QMediaMetaData::Key::ContributingArtist);
      auto duration = meta.value(QMediaMetaData::Key::Duration).toInt();
      auto mediaType = meta.value(QMediaMetaData::Key::MediaType);
      auto trackNumber = meta.value(QMediaMetaData::Key::TrackNumber).toInt();
      m_data.append(PlayListItem{url, title, album, artist, trackNumber, duration, mediaType});
      endInsertRows();
      delete meta_reader;
    }

    switch (status) {
    case QMediaPlayer::LoadedMedia:
      return;
    case QMediaPlayer::BufferingMedia:
    case QMediaPlayer::BufferedMedia:
    case QMediaPlayer::EndOfMedia:
    case QMediaPlayer::InvalidMedia:
    case QMediaPlayer::NoMedia:
    case QMediaPlayer::LoadingMedia:
    case QMediaPlayer::StalledMedia:
      qDebug() << "Media status:" << status;
      delete meta_reader;
      break;
    }
  });
}

  void PlaylistModel::addCsvFile(QString file_name, QModelIndex const &index) {
    PlayListItem &track = m_data[index.row()];
    track.csvUrl = QUrl::fromLocalFile(file_name);
  }
