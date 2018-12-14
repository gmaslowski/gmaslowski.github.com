---
layout: post
title: Creating RAID-1 on Linux without data loss
date: 2018-12-14
description: Mirroring a non-empty drive with RAID-1 on Linux.
category: blog
tag:
- linux
- raid
- nextcloud
comments: true
---

At home I run a server with [Nextcloud](https://nextcloud.com/) for keeping my family pictures, movies, documents and important stuff. Not only it serves as private storage, but also it's important to me that I don't loose the gathered over time memories. The whole server was running already on RAID-1 mirrored disks, but some time ago, one of them failed - and I needed a replacement. 

So I bought a new drive non-SSD drive, with 5400rpm, fully enough for my needs. What's important for me is the access, and this 500GB drive I got for ~40$.

## Initial setup

The server configuration before, the disk failure, was rather easy. Two disks, one old WD 650GB something connected externally to USB drive and a 750GB Seagate SATA. There was a Linux setup RAID-1 on all 3 partitions: OS, swap, data. My oh my, nothing fancy, but gets the job done. Unfortunately, the SATA drive was the one to die :(, so I was left with a USB drive. The only thing to keep the system running after the failure was to make sure that I boot the OS from USB drive. Fair enough.

## How I approached RAID

So I bought new drive. My WD holded something around 200GB of data, since last 6 years. So I got stingy and bought a 500GB drive as replacement for the failed disk. I scalvaged also a 160GB drive, from some laptop I don't use anymore. The reason for that was, that I wanted to get rid of mirroring the system, swap space and GRUB. I remember that configuring this and remembering that with every bootloader update both disks need MBR changes was something I wanted to get rid of. 

### OS

So I installed freshly some newest Ubuntu on to the 160GB drive. Moved all of my settings from the old drive and was happy. Needed to install and configure Docker Swarm cluster again, but since all of my deployed apps (Nexcloud included) are dockerized and idempotent (infrastructure as code) I got everything running smooothly in notime. So what I got was 3 disks:
- 160GB - OS - something which can fail and is easy to recover from in my setup
- 650GB - USB connected WD  
- 500GB - SATA connected drive

What's next? Just recover RAID with `mdadm --add`.

### First surprise(s)

And here it comes. New operating system means, there's no RAID-1 configured. Oh ho. So I need to create RAID-1 again. Thought quickly and said. That's fine. let's do it. Unfortunately, it wouldn't make sense to make create RAID-1 from the existing disk, since the `/dev/sdb5` partition (the one with the data to be mirrored) was already bigger than the full size of the new disk. Ok. I already saw the ~200GB of data I'd need to copy during new RAID setup. Damn it.

So first of all, create a new partition on the new disk with fdisk:

{% highlight bash %}
#: fdisk /dev/sdc
n # - for creating new primary partition, go with defaults
t # - change the type to Linux raid autodetect, fd
w # - write changes
{% endhighlight %}

Now, since the partition is created the hard work starts and that's just because I made a simple mistake. I started copying the files to this drive instead of just creating RAID-1 on top of it. It was the most stupid and not obvious mistake I could do. I mounted the new partition, and copied all of the 200GB data onto it. Than with fdisk I created partition on WD drive matching the new one with:

{% highlight bash %}
#: fdisk /dev/sdb
d # - for partition deletion; deleted all of them
w # - write changes
#: fdisk -d /dev/sdc | fdisk /dev/sdb
{% endhighlight %}

### Creating RAID without data loss

I think this was the time I realized I've made my work doubled. So, there was nothing left for me to do, but just to create the RAID volume/device and copy the data once again onto the new partition on old drive, since that was the one right now without the data, so I could create RAID on top of it and choose the filesystem type.

{% highlight bash %}
#: mdadm --create /dev/md0 --level 1 --raid-devices=2 missing /dev/sdc1
#: mkfs.ext4 /dev/md0
{% endhighlight %}

- missing - means that we'll add the second drive (which for one is the one with data) later on

Now... mounting and copying the ~200GB back, but this time onto (not yet fully setup) RAID. This was the time I was a little bit sad, that my drives aren't SSD :D. After the data was copied, adding the partition to RAID device is easy as:

{% highlight bash %}
#: mdadm --add /dev/md0 /dev/sdb1
{% endhighlight %}

In order to check the RAID status in Ubuntu, just invoke:
{% highlight bash %}
#: mdadm -D /dev/md0
{% endhighlight %}

## Self takeaways
Probably I should have executed the steps with more thinking attached to it :). If I'd remember that RAID recreation without data loss requires manual data copying, I'd just buy and 1TB drive (~50$) and leave the system and swap partitions untouched. Not really sure of that, but I'd think twice, because my private time is limited. The second, and huge mistake was actually copying the data without creating the RAID in the first place. Not really sure what I was thinking. Just forgot about that, I think I was stuck with the thinking that I need to use the "old drive" as the RAID basis, because it was in RAID in the old configuration. Echhh...   

## Links

- [How To Manage RAID Arrays with mdadm on Ubuntu 16.04](https://www.digitalocean.com/community/tutorials/how-to-manage-raid-arrays-with-mdadm-on-ubuntu-16-04)
- [Nextcloud](https://nextcloud.com/)
- [Migrating To RAID1 Mirror on Sarge](https://debian-administration.org/article/238/Migrating_To_RAID1_Mirror_on_Sarge)