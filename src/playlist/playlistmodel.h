#ifndef PLAYLISTMODEL_H
#define PLAYLISTMODEL_H

#include <QAbstractTableModel>
#include <QMediaMetaData>
#include <QMediaPlayer>
#include <QObject>
#include <QUrl>

struct PlayListItem {
  QVariant title = "";
  QVariant album = "";
  QUrl url;
  PlayListItem(QUrl url, QVariant title, QVariant album)
      : title{title}, url{url}, album(album) {}
};

class PlaylistModel : public QAbstractTableModel {
  Q_OBJECT
public:
  explicit PlaylistModel(QObject *parent = nullptr);
  int rowCount(const QModelIndex &parent = QModelIndex()) const override {
    return m_data.count();
  };
  int columnCount(const QModelIndex &parent = QModelIndex()) const override {
    return 1;
  };
  QVariant data(const QModelIndex &index, int role = Qt::DisplayRole) const {
    return m_data[index.row()].title;
  };

public slots:
  void addAudioFile(QString file_name) {
    qDebug() << "addAudioFile:" << file_name;
    beginInsertRows(QModelIndex(), m_data.count(), m_data.count());
    auto url = QUrl::fromLocalFile(file_name);
    auto *meta_reader = new QMediaPlayer();
    meta_reader->setSource(url);
    connect(meta_reader, &QMediaPlayer::mediaStatusChanged, [=]{
      auto status= meta_reader->mediaStatus();
      if (status == QMediaPlayer::LoadedMedia) {
        auto title = meta_reader->metaData().value(QMediaMetaData::Key::Title);
        auto album = meta_reader->metaData().value(QMediaMetaData::Key::AlbumTitle);
        // qDebug() << meta.keys() << meta.isEmpty() << m_meta_reader->duration() << m_meta_reader->mediaStatus() << m_meta_reader->playbackState();
        QMediaMetaData meta = meta_reader->metaData();
        m_data.append(PlayListItem(url, meta.value(QMediaMetaData::Key::Title), meta.value(QMediaMetaData::Key::AlbumTitle)));
        endInsertRows();
        delete meta_reader;
      }

      switch(status) {
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
  };

private:
  QList<PlayListItem> m_data;
};

#endif // PLAYLISTMODEL_H
