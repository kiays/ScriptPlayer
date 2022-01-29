#ifndef MAINWINDOW_H
#define MAINWINDOW_H

#include "playlist/playlistmodel.h"
#include "playlist/playlistview.h"
#include "senderthread.h"
#include <QAudioOutput>
#include <QBluetoothDeviceDiscoveryAgent>
#include <QDropEvent>
#include <QFile>
#include <QFileDialog>
#include <QMainWindow>
#include <QMediaPlayer>
#include <QMessageBox>
#include <QMimeData>
#include <QString>
QT_BEGIN_NAMESPACE
namespace Ui {
class MainWindow;
}
QT_END_NAMESPACE

class MainWindow : public QMainWindow {
  Q_OBJECT

public:
  MainWindow(QWidget *parent = nullptr);
  ~MainWindow();

private slots:
  void on_dropEvent(QDropEvent *event);
  void mousePressEvent(QMouseEvent *event) override;
  void open();
  void on_playButton_clicked();
  void on_discoverButton_clicked();

  void on_pauseButton_clicked();
  void durationChanged(qint64 duration);

  void on_seekBar_sliderMoved(int position);

private:
  Ui::MainWindow *ui;
  QString currentFile;
  QMediaPlayer *m_player;
  QAudioOutput *m_audio_output;
  qint64 m_duration;
  PlaylistModel *m_playlist;
  PlaylistView *m_playlist_view;
  SenderThread *m_ble_worker;
  QBluetoothDeviceDiscoveryAgent *m_deviceDiscoveryAgent;
};
#endif // MAINWINDOW_H
